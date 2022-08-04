<template>
  <ion-app>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title size="large">QRL::Zond</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div id="container">
        <ion-grid v-if="result.address">
          <p>{{ result }}</p>
        </ion-grid>
        <ion-grid v-if="generating">
          <img id="loader" src="icons/loading.gif">
        </ion-grid>
        <ion-grid v-if="!generating && !result.address">
          <ion-row>
            <ion-col></ion-col>
            <ion-col>
              <ion-item>
                <ion-label>Advanced options</ion-label>
                <ion-toggle name="advanced" v-on:click="toggle"></ion-toggle>
              </ion-item>
            </ion-col>
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
              <ion-button expand="block" v-on:click="generateWallet">Create Wallet</ion-button>
            </ion-col>
            <ion-col></ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
  </ion-app>
</template>

<script lang="ts">
/* global QRLLIB */
import randomBytes from 'randombytes'

import { IonRow, IonItem, IonRadioGroup, IonListHeader, IonButton, IonRadio, IonLabel, IonToggle, IonCol, IonGrid, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  components: {
    IonButton,
    IonRadio,
    IonContent,
    IonHeader,
    IonGrid,
    IonCol,
    IonRow,
    IonItem,
    IonRadioGroup,
    IonListHeader,
    IonLabel,
    IonToggle,
    IonPage,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      shown: false,
      generating: false,
      result: {
        address: '',
        hexseed: '',
        mnemonic: '',
      },
      treeHeight: "10",
      hashFunction: "SHA2_256",
    }
  },
  methods: {
    toggle() {
      this.shown = !this.shown
    },
    async generateWallet() {
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
        console.log(Q.getAddress())
        return Q
      }
      setTimeout(() => {
        // hack to ensure DOM is re-rendered showing spinner
        gen({ treeHeight: this.treeHeight, hashFunction: this.hashFunction }).then((Q) => {
          this.generating = false
          this.result = {
            address: Q.getAddress(),
            hexseed: Q.getHexSeed(),
            mnemonic: Q.getMnemonic(),
          }
        })   
      }, 100);
    }
  }
})
</script>

<style>
html {
  width: 400px !important;
  height: 400px !important;
}
</style>