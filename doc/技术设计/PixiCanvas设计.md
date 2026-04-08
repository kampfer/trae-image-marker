# PixiCanvas 设计

## 概述

PixiCanvas 是应用的核心渲染组件，基于 PixiJS 实现图片显示、标注渲染和交互编辑。采用 **React 类组件 + 职责管理器类** 的架构，将 PixiJS 生命周期管理与 React 组件生命周期对齐，同时保持各层逻辑的独立性。

## 组件结构

```
PixiCanvas (React.Component)
├── imageLayerManager: ImageLayerManager
├── annotationLayerManager: AnnotationLayerManager
├── interactionManager: InteractionManager
└── auxiliaryLayerManager: AuxiliaryLayerManager
```

PixiCanvas 组件本身只负责：
- `componentDidMount`：初始化 Pixi Application，实例化各管理器
- `componentDidUpdate`：将新 props diff 后分发给各管理器
- `componentWillUnmount`：销毁所有资源

## PixiJS 渲染树

```
app.stage
├── backgroundLayer
├── imageLayer                  ← ImageLayerManager 负责（受 zoom/rotation/pan 影响）
└── annotationStage             ← AnnotationLayerManager 负责（与 imageLayer 平级）
    ├── annotationLayer         ← 已确认标注
    ├── previewLayer            ← 创建中的预览图形
    └── auxiliaryLayer          ← 辅助线
```

**关键设计**：`annotationStage` 与 `imageLayer` 平级，而非子节点。

- 标注不继承 `imageLayer` 的 rotation，始终保持屏幕方向（满足"标注不随图片旋转"需求）
- 标注不继承 `imageLayer` 的 scale，线条宽度、控制点、文字大小在任何缩放比例下保持视觉固定（满足"缩放时宽度保持固定"需求）

## 坐标系统

所有标注数据存储**图片坐标系**（原始图片像素坐标）。

由于 `annotationStage` 不继承 `imageLayer` 的变换，渲染时需要将图片坐标手动转换为屏幕坐标（先缩放，再旋转，再平移）：

```typescript
// 图片坐标 → 屏幕坐标
function imageToScreen(imageX: number, imageY: number, state: CanvasState): Point;

// 屏幕坐标 → 图片坐标（交互时使用，通过 imageLayer.toLocal() 实现）
function screenToImage(screenX: number, screenY: number): Point;
```

每次 `canvasState` 变化时，`AnnotationLayerManager` 重新计算所有标注的屏幕坐标，同时保持线条宽度等视觉属性不变。Redux 里的标注数据永远是图片坐标，序列化干净，视觉表现与缩放/旋转解耦。

## 文件结构

```
src/components/Canvas/
├── PixiCanvas.tsx
├── managers/
│   ├── ImageLayerManager.ts
│   ├── AnnotationLayerManager.ts
│   ├── InteractionManager.ts
│   └── AuxiliaryLayerManager.ts
├── graphics/
│   ├── AnnotationGraphic.ts        — 抽象基类
│   ├── HorizontalLineGraphic.ts
│   ├── VerticalLineGraphic.ts
│   └── ProtractorGraphic.ts
└── utils/
    └── coordinates.ts
```

---

## PixiCanvas 类组件

### Props

```typescript
interface PixiCanvasProps {
  imageId: string;        // 当前工作区对应的图片 ID
  image: ImageInfo;       // 当前图片信息，包含路径、尺寸等
  canvasState: CanvasState; // 画布状态（zoom、rotation）
  annotations: Annotation[]; // 当前图片的所有标注数据
  activeTool: ToolType;   // 当前激活的工具类型
  dispatch: AppDispatch;  // Redux dispatch 函数
}
```

### 生命周期

```typescript
class PixiCanvas extends React.Component<PixiCanvasProps> {
  private containerRef: React.RefObject<HTMLDivElement>;
  private app: Application | null;
  private imageLayerManager: ImageLayerManager;
  private annotationLayerManager: AnnotationLayerManager;
  private interactionManager: InteractionManager;
  private auxiliaryLayerManager: AuxiliaryLayerManager;

  componentDidMount(): void;    // 初始化 Pixi App，实例化各管理器，执行首次 syncAll
  componentDidUpdate(prevProps: PixiCanvasProps): void; // 对每个 prop 做引用比较，分发给对应管理器；imageId 变化时取消 Session 并重新 syncAll
  componentWillUnmount(): void; // 依次销毁各管理器和 Pixi Application
  private syncAll(props: PixiCanvasProps): void; // 全量同步所有 props 到各管理器
}
```

---

## ImageLayerManager

**职责**：管理图片 Sprite 的加载、缩放、旋转、平移，以及屏幕坐标到图片坐标的转换。

```typescript
class ImageLayerManager {
  readonly layer: Container; // imageLayer，annotationStage 与其平级

  constructor(stage: Container);

  loadImage(image: ImageInfo): Promise<void>; // 加载图片纹理，创建 Sprite，anchor 居中
  applyCanvasState(state: CanvasState): void; // 将 zoom/rotation/pan 应用到 imageLayer
  screenToLocal(screenX: number, screenY: number): Point; // 屏幕坐标 → 图片坐标，供 InteractionManager 使用
  destroy(): void;
}
```

---

## AnnotationLayerManager

**职责**：管理所有已确认标注的渲染。`annotationStage` 与 `imageLayer` 平级，需手动将图片坐标转换为屏幕坐标。线条宽度、控制点大小、文字大小等视觉属性始终使用固定像素值，不随 zoom 缩放。

**对象池策略**：维护 `Map<annotationId, AnnotationGraphic>`，对 Redux 状态做增量 diff：新增时创建实例，更新时调用 `update()`，删除时调用 `destroy()`。

```typescript
class AnnotationLayerManager {
  private annotationStage: Container; // 挂在 app.stage 上，与 imageLayer 平级
  private annotationLayer: Container;
  private previewLayer: Container;
  private graphicMap: Map<string, AnnotationGraphic>;
  private currentCanvasState: CanvasState | null;

  constructor(stage: Container); // annotationStage 挂在 app.stage 上，不作为 imageLayer 子节点

  // canvasState 变化时：通知所有 graphic 重新计算屏幕坐标
  applyCanvasState(state: CanvasState): void;

  // 增量 diff：删除不再存在的，新增或更新变化的；新建 graphic 时立即应用 currentCanvasState
  sync(annotations: Annotation[]): void;

  getPreviewLayer(): Container;
  destroy(): void;
}
```

---

## InteractionManager

**职责**：处理所有鼠标交互，管理标注创建 Session 和拖拽操作。

**交互模式**（三种互斥，切换时清理上一个模式的状态）：

```typescript
type InteractionMode =
  | { type: 'idle' }
  | { type: 'creating'; session: IAnnotationCreationSession }
  | { type: 'dragging'; target: DragTarget }
```

```typescript
class InteractionManager {
  private currentSession: IAnnotationCreationSession | null;

  constructor(
    stage: Container,
    imageLayerManager: ImageLayerManager, // 用于坐标换算
    dispatch: AppDispatch,
    previewLayer: Container
  );

  // 取消旧 Session，创建新 Session；session.done.finally(() => dispatch(resetTool()))
  setActiveTool(toolType: ToolType, imageId: string): void;

  cancelCurrentSession(): void;
  destroy(): void;
}
```

**与 CreationSession 的集成**：

```
dispatch setActiveTool(toolType)
  → PixiCanvas.componentDidUpdate 检测到 activeTool 变化
  → interactionManager.setActiveTool()
  → 创建 Session，session.done.finally(() => dispatch(resetTool()))
  → 鼠标事件经 imageLayer.toLocal() 换算为图片坐标后转发给 Session
  → 用户完成/取消 → activeTool 变回 'none'，Toolbar 按钮恢复默认状态
```

取消时机：用户按 `Esc`、切换工具、切换图片标签页。

---

## AnnotationGraphic 体系

每种标注类型对应一个 Graphic 类，继承自 `AnnotationGraphic` 抽象基类。

```typescript
abstract class AnnotationGraphic {
  readonly container: Container;

  // 标注数据变化时调用，更新图形几何
  abstract update(annotation: Annotation): void;

  // canvasState 变化时调用：用 imageToScreen() 重新计算屏幕坐标；
  // 线条宽度、控制点半径、文字大小等使用固定像素值，不乘以 zoom
  abstract applyCanvasState(state: CanvasState): void;

  destroy(): void; // container.destroy({ children: true })
}

class AnnotationGraphicFactory {
  static create(annotation: Annotation): AnnotationGraphic;
}
```

**各类型图形构成**：

| 类型 | 图形元素 |
|------|---------|
| HorizontalLineGraphic / VerticalLineGraphic | 线段 Graphics + 两个端点控制点 Graphics（选中时显示）+ 距离标签 Text |
| ProtractorGraphic | 两条边 Graphics + 角度弧线 Graphics + 角度数值 Text + 三个控制点 Graphics（顶点 + 两端点） |

---

## 性能策略

| 场景 | 策略 |
|------|------|
| 鼠标移动预览 | 直接操作 PixiJS，完全绕过 Redux |
| 标注增删改 | 对象池 + 增量 diff，不全量重建 |
| props 变化响应 | `componentDidUpdate` 手动引用比较，只更新变化的部分 |
| 图片旋转 | `annotationStage` 不继承 rotation，标注始终保持屏幕方向 |
| 图片缩放 | `annotationStage` 不继承 scale，线宽等固定像素，位置通过 `imageToScreen()` 手动换算 |
