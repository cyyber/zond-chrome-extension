<template>
    <ion-header>
        <ion-toolbar>
            <ion-title size="large">Import Account</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content>
        <ion-item>
            <ion-input placeholder="Account Name" v-model="accountname"></ion-input>
        </ion-item>
        <ion-card>
            <ion-card-header>
                <ion-card-title>
                    Enter your mnemonic phrase:
                </ion-card-title>
            </ion-card-header>

            <ion-card-content>
                <ion-item v-if="!useSeparateWords">
                    <ion-textarea v-model="mnemonic" @ionInput="onMnemonicChange"></ion-textarea>
                </ion-item>

                <ion-item v-else v-for="(word, index) in mnemonicWords" :key="index">
                    <ion-input :ref="'word-' + (index + 1)" v-model="mnemonicWords[index]" :placeholder="'word-' + (index + 1)" @ionInput="focusNextWord(index)"
                        :maxlength="WORD_MAX_LENGTH"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-label>Enter as separate words:</ion-label>
                    <ion-checkbox v-model="useSeparateWords"></ion-checkbox>
                </ion-item>

                <ion-button expand="block" @click="submitMnemonic">
                    Submit
                </ion-button>
                <ion-button expand="block" @click=backToApp>
                    Back
                </ion-button>
            </ion-card-content>
        </ion-card>
    </ion-content>
</template>
  
<script lang="ts">
/* eslint-disable */
import { IonCard, IonButton, IonItem, IonCardContent, IonContent, IonHeader, IonToolbar, IonTitle, IonLabel, IonInput, IonCardHeader, IonCardTitle, IonTextarea, IonCheckbox, modalController } from '@ionic/vue';
import {MnemonicToSeedBin} from '@theqrl/wallet.js/src/utils/mnemonic'
import { defineComponent } from 'vue';
import {Storage} from '@ionic/storage'
import { setStore } from '@/store/ionic-storage';
import {Dilithium} from '@theqrl/wallet.js/src/dilithium'

export default defineComponent({
    name: "Import-Account",
    props:{
        id: String
    },
    beforeMount(){
        this.getWallets(String(this.$route.params.id))
    },
    data() {
        return {
            useSeparateWords: false,
            mnemonic: '',
            mnemonicWords: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            WORD_MAX_LENGTH: 10,
            store: new Storage,
            accountname: '',
            result: {
                username: '',
                wallet: new Array<{
                name: string,
                balance: number,
                address: string,
                hexseed: string,
                mnemonic: string,
                tokens: Array<Record<string, unknown>>
                }>
            },
        };
    },
    components: {
        IonButton,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonCardContent,
        IonCard,
        IonItem,
        IonLabel,
        IonInput,
        IonCardHeader,
        IonCardTitle,
        IonTextarea,
        IonCheckbox
    },
    methods: {
        onMnemonicChange() {
            if (!this.useSeparateWords) {
                const words = this.mnemonic.split(' ');
                if (words.length === 32) {
                    this.mnemonicWords = words;
                }
            }
        },
        async submitMnemonic() {
            const mnemonic = this.useSeparateWords ? this.mnemonicWords.join(' ') : this.mnemonic;
            console.log('Mnemonic entered:', mnemonic);
            let hexSeedBin = MnemonicToSeedBin(mnemonic)
            let Q = new Dilithium(Buffer.from(hexSeedBin))
            this.result.wallet.push({
                name: String(this.accountname),
                balance: 0,
                address: '0x' + Buffer.from(Q.getAddress()).toString('hex'),
                hexseed: '0x' + Q.getSeed().toString('hex'),
                mnemonic: Q.getMnemonic(),
                tokens: []
            })
            var result_wallet_copy: { name: string; balance: number; address: string; hexseed: string; mnemonic: string; tokens: Array<Record<string, unknown>>}[] = []
            this.result.wallet.map((i, idx) => {
                result_wallet_copy.push({
                name: i.name,
                balance: i.balance,
                address: i.address,
                hexseed: i.hexseed,
                mnemonic: i.mnemonic,
                tokens: []
                })
                i.tokens.map((i)=>{
                  result_wallet_copy[idx].tokens.push({
                    address: i.address,
                    decimals: i.decimals,
                    image: i.image,
                    symbol: i.symbol
                  })
                })
            })
            await this.store.set(String(this.id), {username: this.result.username, wallet: [...result_wallet_copy]})
            return modalController.dismiss()
        },
        focusNextWord(index: number) {
            if (index < this.mnemonicWords.length - 1) {
                (this.$refs as any)[`word-${index + 2}`][0].$el.focus();
            }
        },
        async getWallets(id: string) {
            var store = await setStore()
            this.store = store
            var wallet = await store.get(id)
            this.result = wallet
        },
        backToApp() {
            return modalController.dismiss()
        },
    },
});
</script>
  