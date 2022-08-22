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
        <ion-col>
            <ion-button v-on:click="toggleMnemonic">
                <ion-icon slot="icon-only" :icon="eyeOffOutline" v-if="!showMnemonic"></ion-icon>
                <ion-icon slot="icon-only" :icon="eyeOutline" v-if="showMnemonic"></ion-icon>
            </ion-button>
        </ion-col>
    </ion-row>
    <ion-row>
        <ion-col>
            HexSeed
        </ion-col>
        <ion-col>
            {{computedHexSeed}}
        </ion-col>
        <ion-col>
            <ion-button v-on:click="toggleHexSeed">
                <ion-icon slot="icon-only" :icon="eyeOffOutline" v-if="!showHexseed"></ion-icon>
                <ion-icon slot="icon-only" :icon="eyeOutline" v-if="showHexseed"></ion-icon>
            </ion-button>
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
import { IonApp, IonPage, IonGrid, IonRow, IonHeader, IonToolbar, IonContent, IonButton, IonTitle, IonCol, IonIcon, IonLabel, modalController } from "@ionic/vue";
import { defineComponent } from "vue";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";
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
        IonIcon,
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
            showMnemonic: false,
            showHexseed: false,
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
            if(this.showMnemonic) {
                return this.result.wallet[this.index?this.index:0]?.mnemonic
            } else {
                return "************************************"
            }
            
        },
        computedHexSeed(){
            if(this.showHexseed) {
                return this.result.wallet[this.index?this.index:0]?.hexseed
            } else {
                return "************************************"
            }
        }
    },
    beforeMount(){
        this.getWallets(String(this.id), Number(this.index))
    },
    methods: {
        toggleMnemonic(){
            this.showMnemonic = !this.showMnemonic
        },
        toggleHexSeed(){
            this.showHexseed = !this.showHexseed
        },
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
    setup() {
        return {
            eyeOffOutline,
            eyeOutline
        }
    }
})

</script>
<style scoped>
html {
  width: 200px !important;
  height: 200px !important;
}
</style>