<template>
<ion-header>
    <ion-toolbar>
        <ion-title size="large">Create Account</ion-title>
    </ion-toolbar>
</ion-header>
<ion-content>
    <ion-grid v-if="generating">
          <img id="loader" src="icons/loading.gif">
        </ion-grid>
        <ion-grid v-if="!generating">
          <ion-row>
            <ion-item>
              <ion-input placeholder="Account Name" v-model="accountname"></ion-input>
            </ion-item>
          </ion-row>
          <ion-row>
            <ion-col>
            </ion-col>
            <!-- <ion-col>
              <ion-item>
                <ion-label>Advanced options</ion-label>
                <ion-toggle name="advanced" v-on:click="toggle"></ion-toggle>
              </ion-item>
            </ion-col> -->
            <ion-col></ion-col>
          </ion-row>
          <ion-row v-if="shown">
            <ion-col></ion-col>
            <ion-col>
              <ion-radio-group value="SHA2_256" v-model="hashFunction">
                <ion-list-header>
                  <ion-label class="ion-text-left">Hash Function</ion-label>
                </ion-list-header>

                <ion-item>
                  <ion-label>SHA2_256</ion-label>
                  <ion-radio value="SHA2_256"></ion-radio>
                </ion-item>

                <ion-item>
                  <ion-label>SHAKE_128</ion-label>
                  <ion-radio value="SHAKE_128"></ion-radio>
                </ion-item>

                <ion-item>
                  <ion-label>SHAKE_256</ion-label>
                  <ion-radio value="SHAKE_256"></ion-radio>
                </ion-item>
              </ion-radio-group>

              <ion-radio-group value="10" v-model="treeHeight">
                <ion-list-header>
                  <ion-label class="ion-text-left">Tree Height</ion-label>
                </ion-list-header>

                <ion-item>
                  <ion-label>8 (Signatures: 256)</ion-label>
                  <ion-radio value="8"></ion-radio>
                </ion-item>

                <ion-item>
                  <ion-label>10 (Signatures: 1,024)</ion-label>
                  <ion-radio value="10"></ion-radio>
                </ion-item>

                <ion-item>
                  <ion-label>12 (Signatures: 4,096)</ion-label>
                  <ion-radio value="12"></ion-radio>
                </ion-item>

                <ion-item>
                  <ion-label>14 (Signatures: 16,384)</ion-label>
                  <ion-radio value="14"></ion-radio>
                </ion-item>

                <ion-item>
                  <ion-label>16 (Signatures: 65,536)</ion-label>
                  <ion-radio value="16"></ion-radio>
                </ion-item>
              </ion-radio-group>
            </ion-col>
            <ion-col></ion-col>
          </ion-row>
          <ion-row>
            <ion-col></ion-col>
            <ion-col>
              <ion-button expand="block" v-on:click="generateWallet">Create Account</ion-button>
            </ion-col>
            <ion-col></ion-col>
          </ion-row>
          <ion-row>
            <ion-col></ion-col>
            <ion-col>
                <ion-button expand="block" v-on:click="backToApp">
                    Go Back
                </ion-button>
            </ion-col>
            <ion-col></ion-col>
        </ion-row>
        </ion-grid>
</ion-content>
</template>
<script lang="ts">
/* global QRLLIB */
/* eslint-disable */
declare var dilithium: any
import randomBytes from 'randombytes'
import {IonContent, IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonRadio, IonHeader, IonInput, IonToggle, IonRadioGroup, IonListHeader, IonTitle, IonToolbar, modalController} from '@ionic/vue'
import { defineComponent } from 'vue'
import { setStore } from '@/store/ionic-storage';
import {Storage} from '@ionic/storage'
import Mnemonic from '../components/Mnemonic.vue'
require('../qrllib-js.js')

export default defineComponent({
    props:{
        id: String
    },
    data(){
        return {
            shown: false,
            generating: false,
            accountname: '',
            index:0,
            store: new Storage,
            result: {
                username: '',
                wallet: new Array<{
                name: string,
                balance: number,
                address: string,
                hexseed: string,
                mnemonic: string,
                }>
            },
            treeHeight: "10",
            hashFunction: "SHA2_256",
            // id: ''
        }
    },
    components: {
        IonContent,
        IonHeader,
        IonButton,
        IonGrid,
        IonRow,
        IonCol,
        IonItem,
        IonLabel,
        IonRadio,
        IonInput,
        IonRadioGroup,
        IonToggle,
        IonListHeader,
        IonTitle,
        IonToolbar
    },
    beforeMount(){
        this.getWallets(String(this.$route.params.id))
    },
    methods: {
        toggle() {
            this.shown = !this.shown
        },
        async openAccountModal(id: string, index: number) {
            const modal = await modalController.create({
                component: Mnemonic,
                componentProps: {
                id: id,
                index: index
                },
            });
            modal.present();
            let _ = await modal.onDidDismiss()
            modalController.dismiss()

        },
        async getWallets(id: string) {
            var store = await setStore()
            this.store = store
            var wallet = await store.get(id)
            this.result = wallet
        },
        async generateXmssWallet() {
            this.generating = true
            const toUint8Vector = (arr: any) => {
                const vec = new QRLLIB.Uint8Vector();
                for (let i = 0; i < arr.length; i += 1) {
                vec.push_back(arr[i]);
                }
                return vec;
            };
            async function makeWallet(params: any) {
                let XMSS_OBJECT = null
                let hashFunction = null
                if (params.hashFunction === 'SHA2_256') {
                hashFunction = QRLLIB.eHashFunction.SHA2_256
                }
                if (params.hashFunction === 'SHAKE_128') {
                hashFunction = QRLLIB.eHashFunction.SHAKE_128
                }
                if (params.hashFunction === 'SHAKE_256') {
                hashFunction = QRLLIB.eHashFunction.SHAKE_256
                }
                const xmssHeight = parseInt(params.treeHeight)
                const randomSeed = toUint8Vector(await randomBytes(48))
                XMSS_OBJECT = await new QRLLIB.Xmss.fromParameters(randomSeed, xmssHeight, hashFunction)
                return XMSS_OBJECT
            }
            async function gen(params: any) {
                const Q = await makeWallet(params)
                return Q
            }
            setTimeout(() => {
                // hack to ensure DOM is re-rendered showing spinner
                gen({ treeHeight: this.treeHeight, hashFunction: this.hashFunction }).then(async (Q) => {
                this.generating = false
                this.result.wallet.push({
                    name: String(this.accountname),
                    balance: 0,
                    address: Q.GetAddress(),
                    hexseed: Q.getHexSeed(),
                    mnemonic: Q.getMnemonic(),
                })
                var result_wallet_copy: { name: string; balance: number; address: string; hexseed: string; mnemonic: string; }[] = []
                this.result.wallet.map((i) => {
                    result_wallet_copy.push({
                    name: i.name,
                    balance: i.balance,
                    address: i.address,
                    hexseed: i.hexseed,
                    mnemonic: i.mnemonic,
                    })
                })
                await this.store.set(String(this.id), {username: this.result.username, wallet: [...result_wallet_copy]})
                this.index = this.result.wallet.length - 1
                await this.openAccountModal(String(this.id), this.index)
                })   
            }, 100);
        },
        async dilithiumGenerate(){
          var d = dilithium.New()
          return d;
        },
        async generateWallet() {
          // this.generating = true
          this.dilithiumGenerate().then(async (Q: any) => {
            this.generating = false
            this.result.wallet.push({
                name: String(this.accountname),
                balance: 0,
                address: Q.GetAddress(),
                hexseed: Q.GetSeed(),
                mnemonic: Q.GetMnemonic(),
            })
            var result_wallet_copy: { name: string; balance: number; address: string; hexseed: string; mnemonic: string; }[] = []
            this.result.wallet.map((i) => {
                result_wallet_copy.push({
                name: i.name,
                balance: i.balance,
                address: i.address,
                hexseed: i.hexseed,
                mnemonic: i.mnemonic,
                })
            })
            await this.store.set(String(this.id), {username: this.result.username, wallet: [...result_wallet_copy]})
            this.index = this.result.wallet.length - 1
            await this.openAccountModal(String(this.id), this.index)
          })   
        },
        backToApp() {
            return modalController.dismiss()
        },
    }
})
</script>