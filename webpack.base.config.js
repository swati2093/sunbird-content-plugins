module.exports = {
    collectionEditor: {
        replaceRegisterMeta: /(registerMetaPage).*[\s]*?(objectType:.*?])([^)]+)\)/g,
        replaceLoadNgModule: /\b(loadNgModules)\b.*?\)/g,
        replaceBreadCrumb: /(registerBreadcrumb)([^)]+)\)/g,
        replaceEndComma: /;\s*$/,
        dropConsole : false,
        mangle: false,   
        corePlugins: [
            "org.ekstep.conceptselector-1.1",
            "org.ekstep.assetbrowser-1.2",
            "org.ekstep.contenteditorfunctions-1.2",
            "org.ekstep.unitmeta-1.5",
            "org.ekstep.contentmeta-1.5",
            "org.ekstep.courseunitmeta-1.5",
            "org.ekstep.lessonplanunitmeta-1.5",
            "org.ekstep.preview-1.1",
            "org.ekstep.telemetry-1.0",
            "org.ekstep.toaster-1.0",
            "org.ekstep.breadcrumb-1.1",
            "org.ekstep.collectionkeyboardshortcuts-1.0"
        ]
    },
    contentEditor:{
        replaceLoadNgModule: /\b(loadNgModules)\b.*?\)/,
        replaceEndComma: /;\s*$/,
        dropConsole : false,
        mangle: false,    
        corePlugins: [
            "org.ekstep.assessmentbrowser-1.1",
            "org.ekstep.assetbrowser-1.2",
            "org.ekstep.colorpicker-1.0",
            "org.ekstep.conceptselector-1.1",
            "org.ekstep.stage-1.0",
            "org.ekstep.text-1.2",
            "org.ekstep.shape-1.0",
            "org.ekstep.image-1.1",
            "org.ekstep.audio-1.1",
            "org.ekstep.hotspot-1.0",
            "org.ekstep.scribblepad-1.0",
            "org.ekstep.readalongbrowser-1.0",
            "org.ekstep.stageconfig-1.0",
            "org.ekstep.telemetry-1.0",
            "org.ekstep.preview-1.1",
            "org.ekstep.activitybrowser-1.2",
            "org.ekstep.collaborator-1.1",
            "org.ekstep.download-1.0",
            "org.ekstep.unsupported-1.0",
            "org.ekstep.wordinfobrowser-1.0",
            "org.ekstep.viewecml-1.0",
            "org.ekstep.utils-1.0",
            "org.ekstep.help-1.0",
            "org.ekstep.video-1.0",
            "org.ekstep.editorstate-1.0",
            "org.ekstep.contenteditorfunctions-1.2",
            "org.ekstep.keyboardshortcuts-1.0",
            "org.ekstep.richtext-1.0",
            "org.ekstep.iterator-1.0",
            "org.ekstep.navigation-1.0"
        ]
    },
    genericEditor:{
        replaceLoadNgModule: /\b(loadNgModules)\b.*?\)/,
        replaceEndComma: /;\s*$/,
        dropConsole : false,
        mangle: false,
        corePlugins : [
            "org.ekstep.conceptselector-1.1",
            "org.ekstep.assetbrowser-1.2",
            "org.ekstep.uploadcontent-1.1",
            "org.ekstep.contenteditorfunctions-1.2"
        ]
    }
}