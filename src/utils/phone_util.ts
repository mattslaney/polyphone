import { UserAgent } from 'sip.js/lib/api/user-agent';
import { SimpleUser } from 'sip.js/lib/platform/web';
import type { SimpleUserDelegate, SimpleUserOptions } from 'sip.js/lib/platform/web';

export type Line = {
    id: number;
    name?: string;
    username: string;
    password?: string;
    server?: string;
    status: string;
    side?: string;
    phone: SimplePhone | null;
};

export class SimplePhone {
    private simpleUser: SimpleUser | undefined;
    private line: Line;
    private aor: string;
    private username: string;
    private password: string;
    private server: string;

    constructor(line: Line) {
        this.line = line;
        this.username = line.username;
        this.password = <string>line.password;
        this.server = <string>line.server;
        this.aor = `sip:${this.username}@${this.server}`;
    }

    public getRemoteStream = () => {
        return this.simpleUser?.remoteMediaStream;
    };

    public getLocalStream = () => {
        return this.simpleUser?.localMediaStream;
    };

    public async register(simpleUserDelegate: SimpleUserDelegate) {
        const simpleUserOptions: SimpleUserOptions = {
            delegate: simpleUserDelegate,
            media: {
                remote: {
                    audio: new Audio()
                }
            },
            userAgentOptions: {
                //logLevel: "debug",
                displayName: this.username,
                authorizationUsername: this.username,
                authorizationPassword: this.password,
                uri: UserAgent.makeURI(`sip:${this.username}@${this.server}`),
                logBuiltinEnabled: true,
                logConnector: (
                    level: string,
                    category: string,
                    label: string | undefined,
                    content: string) => {
                    /* do nothing for now */
                }
            }
        };

        //Connecting via non-secure websocket for early development work
        this.simpleUser = new SimpleUser(`ws://${this.server}:5066`, simpleUserOptions);
        await this.simpleUser.connect();
        return await this.simpleUser?.register();
    }

    public async unregister() {
        return await this.simpleUser?.disconnect();
    }

    public async call(target: string) {
        return await this.simpleUser?.call(target, {
            inviteWithoutSdp: false
        });
    };

    public async answer() {
        return await this.simpleUser?.answer();
    }

    public async hangup() {
        await this.simpleUser?.hangup();
    };

    public press(key: string) {
        this.simpleUser?.sendDTMF(key);
    }

    public mute() {
        // This mutes the call
        // if (this.simpleUser?.isMuted()) {
        //     this.simpleUser?.unmute();
        // } else {
        //     this.simpleUser?.mute();
        // }

        //Mute local microphone
        if (!this.simpleUser?.localMediaStream) return;
        if (this.simpleUser.localMediaStream.getAudioTracks()[0].enabled) {
            this.simpleUser.localMediaStream.getAudioTracks()[0].enabled = false;
        } else {
            this.simpleUser.localMediaStream.getAudioTracks()[0].enabled = true;
        }
    }

    public isMuted(): boolean {
        if (!this.simpleUser?.localMediaStream) return false;
        return this.simpleUser.localMediaStream.getAudioTracks()[0].enabled;
    }

    public hold() {
        if (this.simpleUser?.isHeld()) {
            this.simpleUser?.unhold();
        } else {
            this.simpleUser?.hold();
        }
    }
}
