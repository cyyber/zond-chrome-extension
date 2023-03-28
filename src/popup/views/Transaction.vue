<template>
<ion-app>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    Account1 -> addr
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid v-if="signing">
                <ion-row>
                    <ion-col></ion-col>
                    <ion-col><img id="loader" src="/icons/loading.gif"></ion-col>
                    <ion-col></ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid v-if="!signing">
                <ion-row>
                    <ion-col><h5>Origin: {{ $route.query.source }}</h5></ion-col>
                </ion-row>
                <ion-row>
                    <ion-col><h5>Transaction Type</h5></ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-button @click="showDetails">
                            Details
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button @click="showData">
                            Data
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row v-if="!show">
                    <ion-col><h5>Estimated Gas fee</h5></ion-col>
                    <ion-col><h5>{{ parseInt(String($route.query.gas)) }}</h5></ion-col>
                </ion-row>
                <ion-row v-if="!show">
                    <ion-col><h5>Total:</h5></ion-col>
                    <ion-col><h5>{{ (parseInt(String($route.query.value)) + parseInt(String($route.query.gas))) }}</h5></ion-col>
                </ion-row>
                <ion-row v-if="show">
                    <ion-col><h5>Hex Data</h5></ion-col>
                </ion-row>
                <ion-row v-if="show">
                    <ion-card>
                        {{$route.query.data}}
                    </ion-card>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-button @click="cancel">
                            Cancel
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button @click="sign">
                            Sign
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</ion-app>
</template>
<script lang="ts">
import { connectPopuptoBackground } from '@/service/controller';
import { setStore } from '@/store/ionic-storage';
import { IonApp, IonPage, IonContent, IonHeader, IonGrid, IonToolbar, IonTitle, IonRow, IonCol, IonButton, IonItem, IonCard } from '@ionic/vue';
import { defineComponent } from 'vue';
import {Storage} from '@ionic/storage'
import {providerWeb3Instance} from '../../service/controller'
import { ResolutionHandler } from 'ionicons/dist/types/stencil-public-runtime';
// var Accounts = require('@theqrl/web3-zond-accounts');
// var accounts = new Accounts('http://127.0.0.1:4545');

export default defineComponent({
    name: "ransaction_view",
    components: {
        IonApp,
        IonPage,
        IonContent,
        IonHeader,
        IonGrid,
        IonToolbar,
        IonTitle,
        IonRow,
        IonCol,
        IonButton,
        IonCard
    },
    data() {
        return {
            signing: false,
            approve: false,
            show: false,
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
        showDetails() {
            this.show = false
        },
        showData(){
            this.show = true
        },
        async sign() {
            let controllerPort = await connectPopuptoBackground()
            this.approve = true
            controllerPort.postMessage({method: "zond_sendTransaction_1", account: this.$route.query.account, approve: true, error: null})
            let hexseed: string
            let web3 = providerWeb3Instance()  
            let wallets = this.result.wallet
            for(let i=0; i < wallets.length; i++) {
                if(wallets[i].address == this.$route.query.account) {   
                    hexseed = wallets[i].hexseed
                }
            }

            controllerPort.onMessage.addListener(async (msg) => {
                if(msg.method == "zond_sendTransaction_2" && msg.params != null && this.approve) {
                    this.signing = true
                    let signedTx = await web3.zond.accounts.signTransaction({
                        from: msg.params[0].from,
                        data: msg.params[0].data,
                        nonce: msg.params[0].nonce,
                        chainId: msg.params[0].chainId?msg.params[0].chainId:"0x1",
                        gas: msg.params[0].gas,
                        gasPrice: msg.params[0].gasPrice,
                        value: msg.params[0].value,
                        to: msg.params[0].to?msg.params[0].to:'',
                    }, hexseed)
                    console.log(signedTx)
                    controllerPort.postMessage({method: "zond_sendTransaction_2", signedTx: signedTx})
                    this.approve = false
                }
                if(msg.method == "zond_sendTransaction_3" && msg.params.success) {
                    window.close()
                }
            })
        },
        async cancel() {
            let controllerPort = await connectPopuptoBackground()
            controllerPort.postMessage({method: "zond_sendTransaction_1", account: this.$route.query.account, approve: false, error: "User denied the signature"})
            window.close()
        }
    }
})
</script>