class TwitchPubsub {
    private LOG_COLOR: string = 'teal'
    private _socket?: WebSockets
    private _config: ITwitchConfig = Config.twitch
    private _pingIntervalHandle?: number
    private _pingTimestamp: number = 0
    private _onRewardCallback: ITwitchPubsubRewardCallback = (message) => { console.log('PubSub Reward unhandled') }
    
    setOnRewardCallback(callback: ITwitchPubsubRewardCallback) {
        this._onRewardCallback = callback
    }

    init() {
        this._socket = new WebSockets(
            "wss://pubsub-edge.twitch.tv",
            30,
            false,
            this.onOpen.bind(this),
            this.onClose.bind(this),
            this.onMessage.bind(this)
        )
        this._socket.init()
    }

    private onOpen(evt:any) {
        Settings.pullSetting<ITwitchTokens>(Settings.TWITCH_TOKENS, 'username', Config.twitch.channelName).then(tokenData => {
            let payload = {
                type: "LISTEN",
                nonce: "7708",
                data: {
                    topics: [
                        `channel-points-channel-v1.${TwitchHelix._channelUserId}`,
                        `channel-subscribe-events-v1.${TwitchHelix._channelUserId}`,
                        `channel-bits-events-v2.${TwitchHelix._channelUserId}`,
                        
                    ],
                    auth_token: tokenData?.access_token
                }
            }
            this._socket?.send(JSON.stringify(payload))
            this._pingIntervalHandle = setInterval(this.ping.bind(this), 4*60*1000) // Ping at least every 5 minutes to keep the connection open
            Utils.log('PubSub connected', this.LOG_COLOR, true, true)
        })
    }

    private onClose(evt:any) {
        clearInterval(this._pingIntervalHandle)
        Utils.log('PubSub disconnected', this.LOG_COLOR, true, true)
    }

    private onMessage(evt:any) {
        let data = JSON.parse(evt.data)
        switch(data.type) {
            case "MESSAGE":
                let payload = JSON.parse(unescape(data?.data?.message))
                if (payload?.type == "reward-redeemed") {
                    let id = payload?.data?.redemption?.reward?.id ?? null
                    Utils.log(`Reward redeemed! (${id})`, this.LOG_COLOR)
                    if(id !== null) this._onRewardCallback(id, payload?.data)
                    else console.log(payload)
                } else {
                    // TODO: Handle things like subs, gifts and raids, possibly? Check for that debug tool Jeppe linked at one point.
                    Utils.log(`Unhandled PubSub message: ${payload?.type}`, Color.Purple)
                }
                break
            case "RECONNECT":
                // Server is doing maintenance or similar and wants us to reconnect
                this._socket?.reconnect()
                break
            case "PONG":
                // If a pong response is older than 10 seconds we are recommended to reconnect
                if(Date.now() - this._pingTimestamp > 10000) this._socket?.reconnect()
                break
            case "RESPONSE":
                Utils.log(evt.data, this.LOG_COLOR)
                break;
            default:
                Utils.log(`Unhandled message: ${data.type}`, this.LOG_COLOR)
                break;
        }
    }

    private ping() {
        let payload = {
            type: "PING"
        }
        this._socket?.send(JSON.stringify(payload))
        this._pingTimestamp = Date.now()
    }
}