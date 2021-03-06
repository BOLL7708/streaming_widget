/**
 * Enables a secure connection to OBS Studio for remote functions through the OBS WebSockets plugin.
 */
interface IObsConfig {
    /**
     * The port set for the OBS WebSockets plugin.
     */
    port:number
    /**
     * When part of a group, turning one source on turns all the others off.
     */
    sourceGroups: string[][]
    /**
     * When part of a group, turning one filter on turns all the others off.
     */
    filterGroups: string[][]
    /**
     * WIP: This appears buggy but would filter certain features to work in certain scenes. 
     * It changed even when messing around in the studio mode though, so for now it's disabled.
     */
    filterOnScenes: string[]
    /**
     * Configuration for taking OBS Source screenshots. 
     * 
     * This is going to be moved into automatic rewards so it can be used for multiple things.
     */
    sourceScreenshotConfig: IObsSourceScreenshotConfig
}
interface IObsSourceScreenshotConfig {
    /**
     * Image format of the screenshot file.
     */
    embedPictureFormat: string
    /**
     * Folder to save the screenshot in.
     */
    saveToFilePath: string
    /**
     * Description for the screenshot when posted to Discord.
     */
	discordDescription: string
    /**
     * Backup game title in the footer when posting to Discord, only used if there is no game registered as running.
     */
    discordGameTitle: string
    /**
     * Title for the screenshot when shown as a Sign.
     */
    signTitle: string
    /**
     * Display duration in milliseconds for the screenshot Sign.
     */
    signDurationMs: number
}

// Callbacks
interface ISceneChangeCallback {
    (sceneName: string): void
}
interface ISourceScreenshotCallback {
    (img: string, data: IScreenshotRequestData, nonce: string): void
}