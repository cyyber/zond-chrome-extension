<template>
<ion-header>
    <ion-toolbar>
        <ion-title size="large">Account details</ion-title>
    </ion-toolbar>
</ion-header>
<ion-content>
    <ion-grid>
    <ion-row>
        <ion-col>
            Address
        </ion-col>
        <ion-col>
            {{computedAddress}}
        </ion-col>
    </ion-row>
    <ion-row>
        <ion-col>
            Mnemonic
        </ion-col>
        <ion-col>
            {{computedMnemonic}}
        </ion-col>
    </ion-row>
    <ion-row>
        <ion-col>
            HexSeed
        </ion-col>
        <ion-col>
            {{computedHexSeed}}
        </ion-col>
    </ion-row>
    <ion-row>
        <ion-col></ion-col>
    </ion-row>
    <ion-row>
        Please copy mnemonic and store in secure location!
    </ion-row>
    <ion-row>
        <ion-col></ion-col>
        <ion-col>
            <ion-button v-on:click="backToApp">
                Done
            </ion-button>
        </ion-col>
        <ion-col></ion-col>
    </ion-row>
    </ion-grid>
</ion-content>
</template>
<script lang="ts">
import { IonApp, IonPage, IonGrid, IonRow, IonHeader, IonToolbar, IonContent, IonButton, IonTitle, IonCol, modalController } from "@ionic/vue";
import { defineComponent } from "vue";
// import { useIonRouter } from '@ionic/vue';
import { useRouter } from "vue-router";
import {Storage} from '@ionic/storage'
import { setStore } from '@/store/ionic-storage';
var router = useRouter()

// router.routeInfo.routeDirection = 'back'
// router.push('some/path', 'back', 'replace')

// // navigation forward
// router.routeInfo.routeDirection = 'forward'
// router.push('some/path', 'forward', 'replace')

export default defineComponent({
    name: "Mnemonic-details",
    components: {
        IonGrid,
        IonRow,
        IonCol,
        IonButton,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
    },
    props: {
        id: String,
        index: Number
    },
    mounted() {
        this.id,
        this.index
    },
    data() {
        return {
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
        }
    },
    computed: {
        computedAddress(){
            return this.result.wallet[this.index?this.index:0]?.address
        },
        computedMnemonic(){
            return this.result.wallet[this.index?this.index:0]?.mnemonic
        },
        computedHexSeed(){
            return this.result.wallet[this.index?this.index:0]?.hexseed
        }
    },
    beforeMount(){
        this.getWallets(String(this.id), Number(this.index))
    },
    methods: {
        copyTestingCode () {
          var testingCodeToCopy = document.querySelector('#testing-code') as HTMLInputElement
          testingCodeToCopy.setAttribute('type', 'text')    // 不是 hidden 才能複製
          testingCodeToCopy.select()

          try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            alert('Testing code was copied ' + msg);
          } catch (err) {
            alert('Oops, unable to copy');
          }

          /* unselect the range */
          testingCodeToCopy?.setAttribute('type', 'hidden')
          window?.getSelection()?.removeAllRanges()
        },
        backToApp() {
            return modalController.dismiss()
        },
        async getWallets(id: string, index: number) {
            var store = await setStore()
            this.store = store
            var wallet = await store.get(id)
            this.result = wallet
        },
    },
})

</script>
<style scoped>
html {
  width: 200px !important;
  height: 200px !important;
}
</style>