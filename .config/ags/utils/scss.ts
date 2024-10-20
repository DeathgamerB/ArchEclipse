import { globalOpacity } from "variables"

// target css file
const tmpCss = `/tmp/tmp-style.css`
const tmpScss = `/tmp/tmp-style.scss`
const cache_dir = `${App.configDir}/../../.cache`
const scss_dir = `${App.configDir}/scss`

export const getCssPath = () => tmpCss

export function refreshCss()
{
    // main scss file
    const scss = `${App.configDir}/scss/style.scss`

    Utils.exec(`bash -c "echo '$OPACITY: ${globalOpacity.value};' | cat - ${scss} > ${tmpScss} | sassc ${tmpScss} ${tmpCss} -I ${scss_dir} -I ${cache_dir}"`)
    App.resetCss()
    App.applyCss(tmpCss)
}

Utils.monitorFile(
    // directory that contains the scss files
    `${App.configDir}/scss`,
    () => refreshCss()
)

Utils.monitorFile(
    // directory that contains pywal colors
    `${App.configDir}/../../.cache/wal/colors.scss`,
    () => refreshCss()
)
