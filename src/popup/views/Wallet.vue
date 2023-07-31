<template>
  <ion-page ref="page">
    <ion-header>

  <ion-toolbar>
    <ion-buttons slot="primary">
      <ion-button v-on:click="openMenuModal(id)">
        <ion-icon slot="icon-only" :icon="menu"></ion-icon>
      </ion-button>
    </ion-buttons>
    <ion-title>QRL Wallet</ion-title>
  </ion-toolbar>

    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div id="container">
        <ion-grid v-if="result.wallet.length > 0">
          <ion-toolbar>
            <ion-buttons slot="start" size="small">
              <ion-button v-if="connected" class="connected-button"> Connected </ion-button>
              <ion-button v-else class="disconnected-button"> 
                Disconnected
              </ion-button>
            </ion-buttons>
            <ion-row>
              <ion-col></ion-col>
              <ion-col>
            <ion-buttons>
              <ion-button>
                <!-- <div class="xyz">
                  <p class="account-name-label">
                     {{computedAccountname}}
                  </p>
                  <p class="account-address-label">
                    {{computedAccountAddress}}
                  </p>
                </div> -->
                {{computedAccountname}}
              </ion-button>
            </ion-buttons>
            </ion-col>
            <ion-col></ion-col>
            </ion-row>
            <ion-buttons slot="end">
              <ion-button v-on:click="openAccountMenuModal(id, index)">
                <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>

          <ion-row>
            <ion-col></ion-col>
          <ion-card>
            <ion-card-header>
              <ion-card-title>QRL Address: {{result.wallet[index].address}}</ion-card-title>
              <ion-card-title></ion-card-title>
              <ion-card-title>QRL Balance = {{result.wallet[index].balance}}</ion-card-title>
            </ion-card-header>
          </ion-card>
          <ion-col></ion-col>
          </ion-row>
          <ion-row>
            <ion-icon></ion-icon>
            <ion-col>
              <ion-button>
                <ion-icon slot="icon-only" :icon="arrowDownCircleOutline"></ion-icon>
                <ion-label>Buy</ion-label>
              </ion-button>
            </ion-col>
            <ion-icon></ion-icon>
            <ion-col>
              <ion-button v-on:click="openSendTransactionModal(id, index)">
                <ion-icon slot="icon-only" :icon="arrowUpCircleOutline"></ion-icon>
                <ion-label>Send</ion-label>
              </ion-button>
            </ion-col>
            <ion-icon></ion-icon>
          </ion-row>
          <!-- <ion-row>
            <ion-col>
              <ion-button expand="full">
                Assets
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button expand="full">
                Activity
              </ion-button>
            </ion-col>
          </ion-row> -->
        </ion-grid>
        <ion-grid v-if="generating">
          <img id="loader" src="icons/loading.gif">
        </ion-grid>
        <ion-grid v-if="result.wallet.length == 0">
          <ion-row>
            <ion-col></ion-col>
            <ion-col>
              <ion-button v-on:click="openCreateAccountModal(id)">
                Create Account
              </ion-button>
            </ion-col>
            <ion-col></ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">

import { IonRow, IonButton, IonLabel, IonCol, IonGrid, IonContent, IonIcon, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonCard, IonCardHeader, IonCardTitle, modalController} from '@ionic/vue';

import { defineComponent} from 'vue';
import {menu, ellipsisVerticalOutline, arrowDownCircleOutline, arrowUpCircleOutline} from 'ionicons/icons';
import { setStore } from '@/store/ionic-storage';
import {Storage} from '@ionic/storage'
import Mnemonic from '../components/Mnemonic.vue'
import Account from '../components/AccountDetails.vue'
import Menu from '../components/WalletMenu.vue' 
import CreateAccount from '../components/CreateAccount.vue';
import SendTransactionVue from '../components/SendTransaction.vue';

export default defineComponent({
  name: 'user-wallet',
  components: {
    IonButton,
    IonContent,
    IonHeader,
    IonGrid,
    IonCol,
    IonRow, 
    IonLabel,
    IonPage,
    IonTitle,
    IonToolbar,    
    IonButtons,
    IonIcon,
    IonCard,
    IonCardTitle,
    IonCardHeader,
  },
  
  data() {
    return {
      shown: false,
      id: '',
      connected: false,
      generating: false,
      accountname: '',
      index:0,
      store: new Storage,
      result: {
        username: '',
        wallet: new Array<{
          name: string,
          balance: number,
          tokens: Array<Record<string, unknown>>,
          address: string,
          hexseed: string,
          mnemonic: string,
        }>
      },
      treeHeight: "10",
      hashFunction: "SHA2_256",
    }
  },
  computed: {
    computedAccountname() {
      return this.result.wallet[this.index?this.index:0].name
    },
    computedAccountAddress() {
      return this.result.wallet[this.index].address
    }
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
    },
    async openAccountMenuModal(id: string, index: number) {
      const modal = await modalController.create({
        component: Account,
        componentProps: {
          id: id,
          index: index
        },
      });
      modal.present();
    },
    async openMenuModal(id: string) {
      const modal = await modalController.create({
        component: Menu,
        componentProps: {
          id: id,
          index: this.index
        },
      });
      modal.present();

      var idx = await modal.onDidDismiss()
      this.index = idx.data
    },
    async openCreateAccountModal(id: string) {
      const modal = await modalController.create({
        component: CreateAccount,
        componentProps: {
          id: id,
        },
      });
      modal.present();
      await modal.onDidDismiss()
      var wallet = await this.store.get(id)
      this.result = wallet
    },
    async openSendTransactionModal(id: string, index: number) {
      const modal = await modalController.create({
        component: SendTransactionVue,
        componentProps: {
          id: id,
          index: index
        },
      });
      modal.present();
    },
    async getWallets(id: string) {
      var store = await setStore()
      this.store = store
      var wallet = await store.get(id)
      this.result = wallet
      this.id = id
    },
  },
  setup() {
    return {
      menu,
      ellipsisVerticalOutline,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
    }
  }
})
</script>

<style>
html {
  width: 400px !important;
  height: 800px !important;
}
</style>
<style scoped>
.account-name-label {
  font-size: small;
  padding: 0%;
  margin-top: 0%;
  margin-bottom: 10%;
  text-align: center;
}
.account-address-label {
  font-size: smaller;
  padding: 0%;
  margin-top: 10%;
  margin-bottom: 0%;
  text-align: center;
}
.connected-button {
  font-size: smaller;
}
.disconnected-button {
  font-size: smaller;
}
.ion-text-center {
  text-align: center;
}
</style>