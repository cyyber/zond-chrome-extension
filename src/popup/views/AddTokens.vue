<template>
    <ion-app>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title size="large">Add Suggested Token</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col></ion-col>
                    <ion-col>
                        Would you like to add these tokens?
                    </ion-col>
                    <ion-col></ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <h4>Token</h4>
                    </ion-col>
                    <ion-col>
                        <h4>balance</h4>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-avatar slot="start">
                            <img src="{{ $route.query.image }}" alt="avatar"/>
                        </ion-avatar>
                        <ion-label>{{ $route.query.symbol }}</ion-label>
                    </ion-col>
                    <ion-col>
                        <ion-label>{{ tokenBalace }}</ion-label>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-button @click="cancel" expand="full">
                            Cancel
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button @click="addToken" expand="full">
                            Add Token
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-footer>
    </ion-page>
    </ion-app>
</template>
<script lang="ts">
import { connectPopuptoBackground, providerWeb3Instance } from '@/service/controller';
import { setStore } from '@/store/ionic-storage';
import { IonApp, IonAvatar, IonButton, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonLabel, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/vue';
import { defineComponent } from 'vue';
import {Storage} from '@ionic/storage'

export default defineComponent({
    name: "Add-tokens",
    data() {
        return {
            index: 0,
            store: new Storage,
            tokenBalace: 0,
            result: {
                username: '',
                wallet: new Array<{
                    name: string,
                    balance: number,
                    tokens: Array<Record<string, unknown>>,
                    address: string,
                    hexseed: string,
                    mnemonic: string,
                    checked: boolean
                }>
            },
        }
    },
    components: {
        IonApp,
        IonPage,
        IonHeader,
        IonToolbar,
        IonContent,
        IonGrid,
        IonRow,
        IonCol,
        IonTitle,
        IonAvatar,
        IonLabel,
        IonFooter,
        IonButton
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
            await this.getTokenBalance(String(this.$route.query.address), String(wallet.wallet[0].address))
        },
        async getTokenBalance(contractAddress: string, accountAddress: string) {
            let minABI = [
                // balanceOf
                {
                    "constant":true,
                    "inputs":[{"name":"_owner","type":"address"}],
                    "name":"balanceOf",
                    "outputs":[{"name":"balance","type":"uint256"}],
                    "type":"function"
                },
                // decimals
                {
                    "constant":true,
                    "inputs":[],
                    "name":"decimals",
                    "outputs":[{"name":"","type":"uint8"}],
                    "type":"function"
                }
            ];
            let web3 = providerWeb3Instance()  
            let contract = new web3.zond.Contract(minABI,contractAddress);
            let balance = await contract.methods.balanceOf(accountAddress).call();
            this.tokenBalace = balance
        },
        async addToken() {
            let controllerPort = await connectPopuptoBackground()
            var result_wallet_copy: { name: string; balance: number; address: string; hexseed: string; mnemonic: string; tokens: Array<Record<string, unknown>> }[] = []
            this.result.wallet.map((i, idx) => {
                let token_copy = [...i.tokens]
                if(idx == this.index) {
                    token_copy.push({
                        address: this.$route.query.address,
                        decimals: this.$route.query.decimals,
                        image: this.$route.query.image,
                        symbol: this.$route.query.symbol
                    })
                }

                result_wallet_copy.push({
                    name: i.name,
                    balance: i.balance,
                    address: i.address,
                    hexseed: i.hexseed,
                    mnemonic: i.mnemonic,
                    tokens: []
                })
                token_copy.map((i)=>{
                  result_wallet_copy[idx].tokens.push({
                    address: i.address,
                    decimals: i.decimals,
                    image: i.image,
                    symbol: i.symbol
                  })
                })
            })
            await this.store.set(String(this.$route.params.id), {username: this.result.username, wallet: [...result_wallet_copy]})
            controllerPort.postMessage({method: "wallet_watchAsset", success: true})
            window.close()

        },
        async cancel() {
            let controllerPort = await connectPopuptoBackground()
            controllerPort.postMessage({method: "wallet_watchAsset", success: false})
            window.close()
        }
    }
})
</script>