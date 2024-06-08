import {
    ViewerApp,
    AssetManagerPlugin,
    timeout,
    SSRPlugin,
    mobileAndTabletCheck,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSAOPlugin,
    GroundPlugin,
    FrameFadePlugin,
    DiamondPlugin,
    // DepthOfFieldPlugin,
    BufferGeometry,
    MeshStandardMaterial2,
    BloomPlugin, 
    TemporalAAPlugin, 
    RandomizedDirectionalLightPlugin, 
    AssetImporter, 
    Color, 
    Mesh,
    ITexture,
    IMaterial,
    DepthOfFieldPlugin,
    VariationConfiguratorPlugin
} from "webgi"
import "./styles.css";

async function setupViewer(){

    let model = await document.getElementById("valueSelect")!

    // Initialize the viewer
    const canvas = document.getElementById('webgi-canvas') as HTMLCanvasElement
    const viewer = new ViewerApp({
        canvas,
        useGBufferDepth: true,
        isAntialiased: false
    })

    viewer.renderer.displayCanvasScaling = Math.min(window.devicePixelRatio, 1)

    const manager = await viewer.addPlugin(AssetManagerPlugin)
    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target
    const diamondsObjectNames = [
        'test'
    ]

    // Add WEBGi plugins
    await viewer.addPlugin(GBufferPlugin)
    await viewer.addPlugin(new ProgressivePlugin(32))
    await viewer.addPlugin(new TonemapPlugin(true))
    const ssr = await viewer.addPlugin(SSRPlugin)
    const ssao = await viewer.addPlugin(SSAOPlugin)
    await viewer.addPlugin(FrameFadePlugin)
    await viewer.addPlugin(GroundPlugin)
    //const bloom = await viewer.addPlugin(BloomPlugin)
    await viewer.addPlugin(TemporalAAPlugin,)
    const diamondPlugin = await viewer.addPlugin(DiamondPlugin)
    //const dof = await viewer.addPlugin(DepthOfFieldPlugin)
    await viewer.addPlugin(RandomizedDirectionalLightPlugin, false)

    ssr!.passes.ssr.passObject.lowQualityFrames = 0
    //bloom.pass!.passObject.bloomIterations = 2
    ssao.passes.ssao.passObject.material.defines.NUM_SAMPLES = 4

    viewer.renderer.refreshPipeline()

    // First import the env map
    const diamondEnvMap = await viewer.getManager()!.importer!.importSinglePath<ITexture>('https://demo-assets.pixotronics.com/pixo/hdr/gem_2.hdr')
    diamondPlugin.envMap = diamondEnvMap!

    // if a separate envMap is specified it is also possible to set the envMapRotation
    diamondPlugin.envMapRotation = Math.PI / 2.0

    await model.addEventListener("change", async (event) => {
        await viewer.scene.disposeSceneModels()
        await viewer.load("https://github.com/jhfacetados/jhfacetados.github.io/raw/main/src/gems/"+event.target!.selectedOptions[0].textContent+".glb")
        await makeDiam(event.target!.selectedOptions[0].textContent);
    })

    async function makeDiam(modelName: string){
        const o = await viewer.scene.findObjectsByName(modelName)[0];

        await diamondPlugin.makeDiamond(
            <IMaterial<any>>o.material,
            {normalMapRes: 256, cacheKey: o.name.split('_')[0].split('-')[1]},
            {isDiamond: true, color: "Red", refractiveIndex: 1.67}
        )
    }
}

setupViewer()