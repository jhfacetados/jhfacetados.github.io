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

    let model = await document.getElementById("selectedModel")!
    let material = await document.getElementById("materialSelect")!
    let imageScrollContainer = await document.getElementById("imageScrollContainer")!

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
    const bloom = await viewer.addPlugin(BloomPlugin)
    await viewer.addPlugin(TemporalAAPlugin,)
    const diamondPlugin = await viewer.addPlugin(DiamondPlugin)
    //const dof = await viewer.addPlugin(DepthOfFieldPlugin)
    await viewer.addPlugin(RandomizedDirectionalLightPlugin, false)

    ssr!.passes.ssr.passObject.lowQualityFrames = 0
    bloom.pass!.passObject.bloomIterations = 2
    ssao.passes.ssao.passObject.material.defines.NUM_SAMPLES = 4

    viewer.renderer.refreshPipeline()

    // First import the env map
    const diamondEnvMap = await viewer.getManager()!.importer!.importSinglePath<ITexture>('https://demo-assets.pixotronics.com/pixo/hdr/gem_2.hdr')
    diamondPlugin.envMap = diamondEnvMap!

    // if a separate envMap is specified it is also possible to set the envMapRotation
    diamondPlugin.envMapRotation = Math.PI / 2.0

    let currentMaterial = ""
    let currentModel = ""

    await imageScrollContainer.addEventListener("click", async (event) => {
        currentModel = model.textContent
        await viewer.scene.disposeSceneModels()
        if(currentMaterial && currentModel){
            let currentModelNumber = currentModel.match(".*? ")[0]
            console.log(currentModelNumber)
            let currentModelName   = currentModel.replace(currentModelNumber, "").replaceAll(" ", "_").replaceAll(".", "")
            console.log(currentModelName)
            let innerModelName     = currentModelNumber.replace(" ", "_").replace(".", "") + currentModelName
            console.log(innerModelName)
            await viewer.load("https://raw.githubusercontent.com/Asdii/gemList/main/gems/"+currentModel+".glb")
            await makeDiam(innerModelName, currentMaterial);
        } 
    })

    await material.addEventListener("change", async (event) => {
        currentMaterial = await event.target!.selectedOptions[0].textContent
        await viewer.scene.disposeSceneModels()
        if(currentMaterial && currentModel){
            let currentModelNumber = currentModel.match(".*? ")[0]
            console.log(currentModelNumber)
            let currentModelName   = currentModel.replace(currentModelNumber, "").replaceAll(" ", "_").replaceAll(".", "")
            console.log(currentModelName)
            let innerModelName     = currentModelNumber.replace(" ", "_").replace(".", "") + currentModelName
            console.log(innerModelName)
            await viewer.load("https://raw.githubusercontent.com/Asdii/gemList/main/gems/"+currentModel+".glb")
            await makeDiam(innerModelName, currentMaterial);
        } 
    })

    async function makeDiam(modelName: string, materialName:any){
        const o = await viewer.scene.findObjectsByName(modelName)[0];

        //let refractiveIndex = materials[material]._ri
        const selectedMaterial = materials.find(material => material._name === materialName);
        const riValue = selectedMaterial._ri;
        const colorValue = selectedMaterial._color;
        const dispersionValue = selectedMaterial._dispersion;

        await diamondPlugin.makeDiamond(
            <IMaterial<any>>o.material,
            {normalMapRes: 256, cacheKey: o.name.split('_')[0].split('-')[1]},
            {isDiamond: true, color: colorValue, refractiveIndex: riValue, dispersion:dispersionValue }
        )
    }
}

setupViewer()