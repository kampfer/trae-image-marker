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
└── imageLayer                  ← ImageLayerManager 负责
    ├── annotationLayer         ← AnnotationLayerManager 负责（子节点，自动跟随变换）
    ├── previewLayer            ← InteractionManager 负责
    └── auxiliaryLayer          ← AuxiliaryLayerManager 负责
```

`annotationLayer` / `previewLayer` / `auxiliaryLayer` 作为 `imageLayer` 的子节点，图片变换时标注自动跟随，无需手动换算坐标。

## 坐标系统

所有标注数据存储的是**图片坐标系**（原始图片像素坐标），渲染时通过 `imageLayer` 的变换矩阵自动转换到屏幕坐标。

交互时通过 `ImageLayerManager.screenToLocal()` 反向换算：

```typescript
function screenToLocal(screenX: number, screenY: number): Point {
  return this.layer.toLocal(new Point(screenX, screenY));
}
```

这样 Redux 里的标注数据永远是图片坐标，不受 zoom/pan/rotation 影响，序列化也更干净。

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

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `imageId` | `string` | 当前工作区对应的图片 ID |
| `image` | `ImageInfo` | 当前图片信息，包含路径、尺寸等 |
| `canvasState` | `CanvasState` | 当前图片的画布状态（zoom、rotation、panX、panY） |
| `annotations` | `Annotation[]` | 当前图片的所有标注数据 |
| `activeTool` | `ToolType` | 当前激活的工具类型 |
| `dispatch` | `AppDispatch` | Redux dispatch 函数 |

### 骨架实现

```typescript
class PixiCanvas extends React.Component<PixiCanvasProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private app: Application | null = null;

  private imageLayerManager!: ImageLayerManager;
  private annotationLayerManager!: AnnotationLayerManager;
  private interactionManager!: InteractionManager;
  private auxiliaryLayerManager!: AuxiliaryLayerManager;

  componentDidMount() {
    const container = this.containerRef.current!;
    this.app = new Application({ resizeTo: container, backgroundAlpha: 0 });
    container.appendChild(this.app.view as HTMLCanvasElement);

    this.imageLayerManager = new ImageLayerManager(this.app.stage);
    this.annotationLayerManager = new AnnotationLayerManager(
      this.imageLayerManager.layer
    );
    this.interactionManager = new InteractionManager(
      this.app.stage,
      this.imageLayerManager,
      this.props.dispatch,
      this.annotationLayerManager.getPreviewLayer()
    );
    this.auxiliaryLayerManager = new AuxiliaryLayerManager(
      this.imageLayerManager.layer
    );

    this.syncAll(this.props);
  }

  componentDidUpdate(prevProps: PixiCanvasProps) {
    const p = this.props;

    if (p.image !== prevProps.image) {
      this.imageLayerManager.loadImage(p.image);
    }
    if (p.canvasState !== prevProps.canvasState) {
      this.imageLayerManager.applyCanvasState(p.canvasState);
    }
    if (p.annotations !== prevProps.annotations) {
      this.annotationLayerManager.sync(p.annotations);
    }
    if (p.activeTool !== prevProps.activeTool) {
      this.interactionManager.setActiveTool(p.activeTool, p.imageId);
    }
    // imageId 切换时重置所有状态
    if (p.imageId !== prevProps.imageId) {
      this.interactionManager.cancelCurrentSession();
      this.syncAll(p);
    }
  }

  componentWillUnmount() {
    this.interactionManager.destroy();
    this.annotationLayerManager.destroy();
    this.imageLayerManager.destroy();
    this.auxiliaryLayerManager.destroy();
    this.app?.destroy(true);
  }

  private syncAll(props: PixiCanvasProps) {
    this.imageLayerManager.loadImage(props.image);
    this.imageLayerManager.applyCanvasState(props.canvasState);
    this.annotationLayerManager.sync(props.annotations);
    this.interactionManager.setActiveTool(props.activeTool, props.imageId);
  }

  render() {
    return <div ref={this.containerRef} style={{ width: '100%', height: '100%' }} />;
  }
}
```

---

## ImageLayerManager

**职责**：管理图片 Sprite 的加载、缩放、旋转、平移，以及屏幕坐标到图片坐标的转换。

```typescript
class ImageLayerManager {
  readonly layer: Container; // annotationLayer 等挂在这下面
  private sprite: Sprite | null = null;

  constructor(stage: Container) {
    this.layer = new Container();
    stage.addChild(this.layer);
  }

  async loadImage(image: ImageInfo) {
    this.sprite?.destroy();
    const texture = await Assets.load(image.path);
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.layer.addChildAt(this.sprite, 0);
  }

  applyCanvasState(state: CanvasState) {
    this.layer.scale.set(state.zoom);
    this.layer.rotation = (state.rotation * Math.PI) / 180;
    this.layer.position.set(state.panX, state.panY);
  }

  screenToLocal(screenX: number, screenY: number): Point {
    return this.layer.toLocal(new Point(screenX, screenY));
  }

  destroy() {
    this.sprite?.destroy();
    this.layer.destroy();
  }
}
```

---

## AnnotationLayerManager

**职责**：管理所有已确认标注的渲染，使用对象池做增量 diff，避免全量重建 PixiJS 对象。

### 对象池策略

维护 `Map<annotationId, AnnotationGraphic>`，Redux 状态变化时：
- 新增 → 创建 graphic 实例，加入 map
- 更新 → 调用 `instance.update()`
- 删除 → 调用 `instance.destroy()`，从 map 移除

```typescript
class AnnotationLayerManager {
  private annotationLayer: Container;
  private previewLayer: Container;
  private graphicMap = new Map<string, AnnotationGraphic>();

  constructor(imageLayer: Container) {
    this.annotationLayer = new Container();
    this.previewLayer = new Container();
    imageLayer.addChild(this.annotationLayer);
    imageLayer.addChild(this.previewLayer);
  }

  sync(annotations: Annotation[]) {
    const incoming = new Set(annotations.map(a => a.id));

    // 删除不再存在的
    for (const [id, graphic] of this.graphicMap) {
      if (!incoming.has(id)) {
        graphic.destroy();
        this.graphicMap.delete(id);
      }
    }

    // 新增或更新
    for (const annotation of annotations) {
      if (this.graphicMap.has(annotation.id)) {
        this.graphicMap.get(annotation.id)!.update(annotation);
      } else {
        const graphic = AnnotationGraphicFactory.create(annotation);
        this.annotationLayer.addChild(graphic.container);
        this.graphicMap.set(annotation.id, graphic);
      }
    }
  }

  getPreviewLayer(): Container {
    return this.previewLayer;
  }

  destroy() {
    this.graphicMap.forEach(g => g.destroy());
    this.annotationLayer.destroy();
    this.previewLayer.destroy();
  }
}
```

---

## InteractionManager

**职责**：处理所有鼠标交互，管理标注创建 Session 和拖拽操作，将高频鼠标事件路由到正确的处理逻辑。

### 交互模式

三种模式互斥，切换时清理上一个模式的状态：

```typescript
type InteractionMode =
  | { type: 'idle' }
  | { type: 'creating'; session: IAnnotationCreationSession }
  | { type: 'dragging'; target: DragTarget }
```

### 实现

```typescript
class InteractionManager {
  private currentSession: IAnnotationCreationSession | null = null;

  constructor(
    private stage: Container,
    private imageLayerManager: ImageLayerManager,
    private dispatch: AppDispatch,
    private previewLayer: Container
  ) {
    this.stage.eventMode = 'static';
    this.stage.on('pointerdown', this.onPointerDown, this);
    this.stage.on('pointermove', this.onPointerMove, this);
    this.stage.on('pointerup', this.onPointerUp, this);
  }

  setActiveTool(toolType: ToolType, imageId: string) {
    this.cancelCurrentSession();
    if (toolType === 'none') return;

    this.currentSession = createAnnotationSession(
      toolType,
      imageId,
      this.dispatch,
      (preview) => this.renderPreview(preview) // 直接操作 PixiJS，不过 Redux
    );

    this.currentSession.done
      .catch(() => {}) // 取消是正常情况，忽略
      .finally(() => this.dispatch(resetTool()));
  }

  cancelCurrentSession() {
    this.currentSession?.cancel();
    this.currentSession = null;
  }

  private onPointerDown(e: FederatedPointerEvent) {
    const local = this.imageLayerManager.screenToLocal(e.globalX, e.globalY);
    this.currentSession?.handleClick(local.x, local.y);
  }

  private onPointerMove(e: FederatedPointerEvent) {
    const local = this.imageLayerManager.screenToLocal(e.globalX, e.globalY);
    this.currentSession?.handleMouseMove(local.x, local.y);
  }

  private onPointerUp(e: FederatedPointerEvent) {
    // 拖拽结束处理
  }

  private renderPreview(preview: CreationPreview | null) {
    this.previewLayer.removeChildren();
    if (!preview) return;
    const g = new Graphics();
    // 根据 preview 类型绘制对应图形
    this.previewLayer.addChild(g);
  }

  destroy() {
    this.cancelCurrentSession();
    this.stage.off('pointerdown', this.onPointerDown, this);
    this.stage.off('pointermove', this.onPointerMove, this);
    this.stage.off('pointerup', this.onPointerUp, this);
  }
}
```

### 与 CreationSession 的集成

```
用户点击 Toolbar 按钮
  → dispatch setActiveTool(toolType)
  → PixiCanvas.componentDidUpdate 检测到 activeTool 变化
  → interactionManager.setActiveTool()
  → 创建 Session，session.done.finally(() => dispatch(resetTool()))
  → 用户完成/取消创建
  → activeTool 变回 'none'，Toolbar 按钮恢复默认状态
```

取消时机：
- 用户按 `Esc` 键
- 切换到其他工具（`setActiveTool` 先 cancel 旧 Session）
- 切换图片标签页（`componentDidUpdate` 检测到 `imageId` 变化）

---

## AnnotationGraphic 体系

### 抽象基类

```typescript
abstract class AnnotationGraphic {
  readonly container: Container;

  constructor() {
    this.container = new Container();
  }

  abstract update(annotation: Annotation): void;

  destroy() {
    this.container.destroy({ children: true });
  }
}
```

### 工厂

```typescript
class AnnotationGraphicFactory {
  static create(annotation: Annotation): AnnotationGraphic {
    switch (annotation.type) {
      case 'horizontal-line': return new HorizontalLineGraphic(annotation);
      case 'vertical-line':   return new VerticalLineGraphic(annotation);
      case 'normal-protractor':
      case 'horizontal-protractor':
      case 'vertical-protractor': return new ProtractorGraphic(annotation);
      default: throw new Error(`Unknown annotation type: ${annotation.type}`);
    }
  }
}
```

### 各类型实现要点

**HorizontalLineGraphic / VerticalLineGraphic**：
- 一个 `Graphics` 绘制线段本体
- 两个小圆形 `Graphics` 作为端点控制点（选中时显示）
- 一个 `Text` 显示辅助线距离标签

**ProtractorGraphic**：
- 两个 `Graphics` 绘制两条边
- 一个 `Graphics` 绘制角度弧线
- 一个 `Text` 显示角度数值
- 三个小圆形控制点（顶点 + 两个端点）

---

## 性能策略

| 场景 | 策略 |
|------|------|
| 鼠标移动预览 | 直接操作 PixiJS，完全绕过 Redux |
| 标注增删改 | 对象池 + 增量 diff，不全量重建 |
| props 变化响应 | `componentDidUpdate` 手动 diff，只更新变化的部分 |
| 图片变换 | 子节点自动继承 `imageLayer` 变换，无需逐个更新标注坐标 |
