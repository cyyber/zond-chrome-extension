<template>
    <ion-app>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Signature Request</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <h3>Account: {{ $route.query.account }}</h3>
                </ion-row>
                <ion-row>
                    <h3>Origin: {{ $route.query.source }}</h3>
                </ion-row>
                <ion-row></ion-row>
                <ion-row></ion-row>
                <ion-row>
                    <ion-text color="warning"><h4>Warning: Signing this message can be dangerous. This signature could potentially perform any operation on your account's behalf, including granting complete control of your account and all of its assets to the requesting site. Only sign this message if you know what you're doing or completely trust the requesting site.</h4></ion-text>
                </ion-row>
                <ion-row>
                    <h3>Message: {{ $route.query.message }}</h3>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-button @click="cancel">cancel</ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button @click="sign">sign</ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
    </ion-app>
</template>
<script lang="ts">
import {connectPopuptoBackground} from '@/service/controller';
import { setStore } from '@/store/ionic-storage';
import { IonApp, IonPage, IonHeader, IonContent, IonButton, IonCol, IonGrid, IonRow, IonTitle, IonToolbar, IonText } from '@ionic/vue';
import { defineComponent } from 'vue';
import {Storage} from '@ionic/storage';
import dilithiumWallet from '@theqrl/wallet.js';

export default defineComponent({
    name:'User-signature',
    components: {
        IonApp,
        IonPage,
        IonHeader,
        IonContent,
        IonToolbar,
        IonTitle,
        IonGrid,
        IonRow,
        IonCol,
        IonButton,
        IonText
    },
    data() {
        return {
            store: new Storage,
            result: {
                username: '',
                wallet: new Array<{
                    name: string,
                    tokens: Array<Record<string, unknown>>,
                    balance: number,
                    address: string,
                    hexseed: string,
                    mnemonic: string,
                }>
            },
        }
    },
    beforeMount(){
        this.getWallets(String(this.$route.params.id))
    },
    methods: {
        async getWallets(id: string) {
            var store = await setStore()
            this.store = store
            var wallet = await store.get(id)
            this.result = wallet
        },
        async sign() {
            let controllerPort = await connectPopuptoBackground()
            this.result.wallet.map(async (i) => {
                if(i.address == this.$route.query.account) {
                    let dilithium = await dilithiumWallet.NewDilithiumFromSeed(Buffer.from(i.hexseed.slice(2), 'hex'))
                    let signedMessage = await dilithium.Sign(Buffer.from(String(this.$route.query.message)))
                    controllerPort.postMessage({method: "zond_sign", signature: '0x' + Buffer.from(signedMessage).toString('hex'), error: null})
                    window.close()
                }
            })
        },
        async cancel() {
            let controllerPort = await connectPopuptoBackground()
            controllerPort.postMessage({method: "zond_sign", signature: null, error: "User denied the signature"})
            window.close()
        }
    }
})
</script>