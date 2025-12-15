// Service-specific form field configurations with i18n keys
export const serviceFormConfigs = {
    web: {
        labelKey: 'order.serviceDetails.web.title',
        fields: [
            {
                id: 'websiteType', labelKey: 'order.serviceDetails.web.websiteType', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.web.options.companyProfile', 'order.serviceDetails.web.options.ecommerce', 'order.serviceDetails.web.options.landingPage', 'order.serviceDetails.web.options.portfolio', 'order.serviceDetails.web.options.blog', 'order.serviceDetails.web.options.custom']
            },
            {
                id: 'pageCount', labelKey: 'order.serviceDetails.web.pageCount', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.common.pages1to5', 'order.serviceDetails.common.pages6to10', 'order.serviceDetails.common.pages11to20', 'order.serviceDetails.common.pages20plus']
            },
            {
                id: 'features', labelKey: 'order.serviceDetails.web.features', type: 'checkbox',
                optionKeys: ['order.serviceDetails.web.options.contactForm', 'order.serviceDetails.web.options.gallery', 'order.serviceDetails.web.options.blog', 'order.serviceDetails.web.options.ecommerce', 'order.serviceDetails.web.options.multilang', 'order.serviceDetails.web.options.cms']
            },
            { id: 'referenceUrl', labelKey: 'order.serviceDetails.web.referenceUrl', type: 'text', placeholderKey: 'order.serviceDetails.web.referenceUrlPlaceholder' },
            { id: 'needDomain', labelKey: 'order.serviceDetails.web.needDomain', type: 'select', optionKeys: ['order.serviceDetails.common.dontHave', 'order.serviceDetails.common.alreadyHave', 'order.serviceDetails.common.needHelp'] },
            { id: 'needHosting', labelKey: 'order.serviceDetails.web.needHosting', type: 'select', optionKeys: ['order.serviceDetails.common.dontHave', 'order.serviceDetails.common.alreadyHave', 'order.serviceDetails.common.needHelp'] }
        ]
    },
    mobile: {
        labelKey: 'order.serviceDetails.mobile.title',
        fields: [
            {
                id: 'platform', labelKey: 'order.serviceDetails.mobile.platform', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.mobile.options.android', 'order.serviceDetails.mobile.options.ios', 'order.serviceDetails.mobile.options.both']
            },
            {
                id: 'appType', labelKey: 'order.serviceDetails.mobile.appType', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.mobile.options.native', 'order.serviceDetails.mobile.options.crossPlatform']
            },
            {
                id: 'appFeatures', labelKey: 'order.serviceDetails.mobile.features', type: 'checkbox',
                optionKeys: ['order.serviceDetails.mobile.options.auth', 'order.serviceDetails.mobile.options.pushNotif', 'order.serviceDetails.mobile.options.payment', 'order.serviceDetails.mobile.options.maps', 'order.serviceDetails.mobile.options.socialLogin', 'order.serviceDetails.mobile.options.chat']
            },
            { id: 'apiIntegration', labelKey: 'order.serviceDetails.mobile.apiIntegration', type: 'select', optionKeys: ['order.serviceDetails.common.yes', 'order.serviceDetails.common.no', 'order.serviceDetails.common.notSure'] },
            { id: 'adminPanel', labelKey: 'order.serviceDetails.mobile.adminPanel', type: 'select', optionKeys: ['order.serviceDetails.common.yes', 'order.serviceDetails.common.no'] },
            { id: 'referenceApp', labelKey: 'order.serviceDetails.mobile.referenceApp', type: 'text', placeholderKey: 'order.serviceDetails.mobile.referenceAppPlaceholder' }
        ]
    },
    wordpress: {
        labelKey: 'order.serviceDetails.wordpress.title',
        fields: [
            {
                id: 'wpType', labelKey: 'order.serviceDetails.wordpress.wpType', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.wordpress.options.newSite', 'order.serviceDetails.wordpress.options.themeCustom', 'order.serviceDetails.wordpress.options.pluginDev', 'order.serviceDetails.wordpress.options.maintenance']
            },
            { id: 'wpEcommerce', labelKey: 'order.serviceDetails.wordpress.wpEcommerce', type: 'select', optionKeys: ['order.serviceDetails.common.yes', 'order.serviceDetails.common.no'] },
            {
                id: 'pageCount', labelKey: 'order.serviceDetails.web.pageCount', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.common.pages1to5', 'order.serviceDetails.common.pages6to10', 'order.serviceDetails.common.pages11to20', 'order.serviceDetails.common.pages20plus']
            },
            {
                id: 'wpPlugins', labelKey: 'order.serviceDetails.wordpress.plugins', type: 'checkbox',
                optionKeys: ['order.serviceDetails.wordpress.options.seo', 'order.serviceDetails.wordpress.options.backup', 'order.serviceDetails.wordpress.options.security', 'order.serviceDetails.wordpress.options.contactForm', 'order.serviceDetails.wordpress.options.gallery', 'order.serviceDetails.wordpress.options.multilang']
            },
            { id: 'existingUrl', labelKey: 'order.serviceDetails.wordpress.existingUrl', type: 'text', placeholderKey: 'order.serviceDetails.wordpress.existingUrlPlaceholder' }
        ]
    },
    video: {
        labelKey: 'order.serviceDetails.video.title',
        fields: [
            {
                id: 'mediaType', labelKey: 'order.serviceDetails.video.mediaType', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.video.options.videoEdit', 'order.serviceDetails.video.options.photoEdit', 'order.serviceDetails.video.options.motionGraphics', 'order.serviceDetails.video.options.all']
            },
            {
                id: 'videoDuration', labelKey: 'order.serviceDetails.video.duration', type: 'select',
                optionKeys: ['order.serviceDetails.video.options.under1min', 'order.serviceDetails.video.options.1to3min', 'order.serviceDetails.video.options.3to5min', 'order.serviceDetails.video.options.5to10min', 'order.serviceDetails.video.options.over10min']
            },
            { id: 'quantity', labelKey: 'order.serviceDetails.video.quantity', type: 'number', required: true, placeholderKey: 'order.serviceDetails.video.quantityPlaceholder' },
            {
                id: 'mediaPurpose', labelKey: 'order.serviceDetails.video.purpose', type: 'select',
                optionKeys: ['order.serviceDetails.video.options.socialMedia', 'order.serviceDetails.video.options.marketing', 'order.serviceDetails.video.options.event', 'order.serviceDetails.video.options.product', 'order.serviceDetails.video.options.corporate']
            },
            {
                id: 'outputFormats', labelKey: 'order.serviceDetails.video.outputFormat', type: 'checkbox',
                optionKeys: ['order.serviceDetails.video.options.instagram', 'order.serviceDetails.video.options.youtube', 'order.serviceDetails.video.options.tiktok', 'order.serviceDetails.video.options.facebook', 'order.serviceDetails.video.options.print']
            },
            { id: 'styleReference', labelKey: 'order.serviceDetails.video.styleRef', type: 'text', placeholderKey: 'order.serviceDetails.video.styleRefPlaceholder' }
        ]
    },
    uiux: {
        labelKey: 'order.serviceDetails.uiux.title',
        fields: [
            {
                id: 'uiPlatform', labelKey: 'order.serviceDetails.uiux.platform', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.uiux.options.web', 'order.serviceDetails.uiux.options.mobile', 'order.serviceDetails.uiux.options.both']
            },
            {
                id: 'screenCount', labelKey: 'order.serviceDetails.uiux.screenCount', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.uiux.options.1to5', 'order.serviceDetails.uiux.options.6to10', 'order.serviceDetails.uiux.options.11to20', 'order.serviceDetails.uiux.options.20plus']
            },
            {
                id: 'deliverables', labelKey: 'order.serviceDetails.uiux.deliverables', type: 'checkbox',
                optionKeys: ['order.serviceDetails.uiux.options.wireframe', 'order.serviceDetails.uiux.options.mockup', 'order.serviceDetails.uiux.options.prototype', 'order.serviceDetails.uiux.options.designSystem']
            },
            {
                id: 'designStyle', labelKey: 'order.serviceDetails.uiux.designStyle', type: 'select',
                optionKeys: ['order.serviceDetails.uiux.options.modern', 'order.serviceDetails.uiux.options.corporate', 'order.serviceDetails.uiux.options.playful', 'order.serviceDetails.uiux.options.luxury', 'order.serviceDetails.uiux.options.custom']
            },
            { id: 'brandGuidelines', labelKey: 'order.serviceDetails.uiux.brandGuidelines', type: 'select', optionKeys: ['order.serviceDetails.common.alreadyHave', 'order.serviceDetails.uiux.options.createNew'] },
            { id: 'designReference', labelKey: 'order.serviceDetails.uiux.designRef', type: 'text', placeholderKey: 'order.serviceDetails.uiux.designRefPlaceholder' }
        ]
    },
    maintenance: {
        labelKey: 'order.serviceDetails.maintenance.title',
        fields: [
            {
                id: 'deviceType', labelKey: 'order.serviceDetails.maintenance.deviceType', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.maintenance.options.smartphone', 'order.serviceDetails.maintenance.options.laptop', 'order.serviceDetails.maintenance.options.tablet', 'order.serviceDetails.maintenance.options.desktop', 'order.serviceDetails.maintenance.options.allinone', 'order.serviceDetails.maintenance.options.other']
            },
            { id: 'deviceBrand', labelKey: 'order.serviceDetails.maintenance.brand', type: 'text', required: true, placeholderKey: 'order.serviceDetails.maintenance.brandPlaceholder' },
            { id: 'deviceModel', labelKey: 'order.serviceDetails.maintenance.model', type: 'text', required: true, placeholderKey: 'order.serviceDetails.maintenance.modelPlaceholder' },
            { id: 'serialNumber', labelKey: 'order.serviceDetails.maintenance.serialNumber', type: 'text', placeholderKey: 'order.serviceDetails.maintenance.serialNumberPlaceholder' },
            {
                id: 'deviceCondition', labelKey: 'order.serviceDetails.maintenance.deviceCondition', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.maintenance.options.canTurnOn', 'order.serviceDetails.maintenance.options.cannotTurnOn', 'order.serviceDetails.maintenance.options.intermittent', 'order.serviceDetails.maintenance.options.bootLoop']
            },
            {
                id: 'problemTypes', labelKey: 'order.serviceDetails.maintenance.problemType', type: 'checkbox', required: true,
                optionKeys: [
                    'order.serviceDetails.maintenance.options.screen',
                    'order.serviceDetails.maintenance.options.battery',
                    'order.serviceDetails.maintenance.options.charging',
                    'order.serviceDetails.maintenance.options.speaker',
                    'order.serviceDetails.maintenance.options.microphone',
                    'order.serviceDetails.maintenance.options.camera',
                    'order.serviceDetails.maintenance.options.keyboard',
                    'order.serviceDetails.maintenance.options.touchpad',
                    'order.serviceDetails.maintenance.options.wifi',
                    'order.serviceDetails.maintenance.options.bluetooth',
                    'order.serviceDetails.maintenance.options.storage',
                    'order.serviceDetails.maintenance.options.ram',
                    'order.serviceDetails.maintenance.options.software',
                    'order.serviceDetails.maintenance.options.virus',
                    'order.serviceDetails.maintenance.options.performance',
                    'order.serviceDetails.maintenance.options.overheating',
                    'order.serviceDetails.maintenance.options.hardware'
                ]
            },
            { id: 'problemDescription', labelKey: 'order.serviceDetails.maintenance.problemDesc', type: 'textarea', required: true, placeholderKey: 'order.serviceDetails.maintenance.problemDescPlaceholder' },
            {
                id: 'warrantyStatus', labelKey: 'order.serviceDetails.maintenance.warrantyStatus', type: 'select',
                optionKeys: ['order.serviceDetails.maintenance.options.inWarranty', 'order.serviceDetails.maintenance.options.outWarranty', 'order.serviceDetails.maintenance.options.notSure']
            },
            {
                id: 'backupStatus', labelKey: 'order.serviceDetails.maintenance.backupStatus', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.maintenance.options.backupDone', 'order.serviceDetails.maintenance.options.noBackup', 'order.serviceDetails.maintenance.options.helpBackup']
            },
            {
                id: 'pickupMethod', labelKey: 'order.serviceDetails.maintenance.pickupMethod', type: 'select', required: true,
                optionKeys: ['order.serviceDetails.maintenance.options.dropOff', 'order.serviceDetails.maintenance.options.pickup', 'order.serviceDetails.maintenance.options.onsite']
            },
            { id: 'pickupAddress', labelKey: 'order.serviceDetails.maintenance.pickupAddress', type: 'textarea', placeholderKey: 'order.serviceDetails.maintenance.pickupAddressPlaceholder' }
        ]
    }
}

export type ServiceId = keyof typeof serviceFormConfigs
