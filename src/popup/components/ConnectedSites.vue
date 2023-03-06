<template>
<ion-header>
    <ion-toolbar>
        <ion-button slot="start" @click="backToApp">
            <ion-icon :icon="arrowBackOutline">
            </ion-icon>
        </ion-button>
        <ion-title size="large">Connected Sites</ion-title>
    </ion-toolbar>
</ion-header>
<ion-content>
    <ion-list>
        <ion-item v-for="item in items" :key="item">
          <ion-label>{{ item }}</ion-label>
          <ion-button @click="disconnectSite(item)">Disconnect</ion-button>
        </ion-item>
    </ion-list>

    <ion-infinite-scroll
        @ionInfinite="loadData($event)"
        threshold="100px"
        id="infinite-scroll"
        :disabled="isDisabled"
    >
        <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Loading more data...">
        </ion-infinite-scroll-content>
    </ion-infinite-scroll>
</ion-content>
</template>
<script lang="ts">
import {connectPopuptoBackground} from '@/service/controller';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonButton, modalController, IonIcon } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import {arrowBackOutline} from "ionicons/icons"

export default defineComponent({
    components: {
        IonHeader,
        IonContent,
        IonToolbar,
        IonTitle,
        IonInfiniteScroll,
        IonInfiniteScrollContent,
        IonList,
        IonItem,
        IonLabel,
        IonButton,
        IonIcon
    },
    props: {
        connectedSites: {
            default: [],
            type: Array<string>
        },
        account: String,
    },
    mounted () {
        this.connectedSites,
        this.account 
    },
    methods: {
        async disconnectSite(key: string) {
            let controllerPort = await connectPopuptoBackground()
            controllerPort.postMessage({
                method: "remove_connectedSites",
                value: {
                    site: key,
                    account: this.account
                }

            })
            controllerPort.onMessage.addListener(async (msg)=> {
                if(msg.method == "remove_connectedSites" && msg.value.site == key && msg.value.account == this.account) {
                    return modalController.dismiss()
                }
            })

        },
        backToApp() {
            return modalController.dismiss()
        },
    },
    setup(props) {
      const isDisabled = ref(false);
      const toggleInfiniteScroll = () => {
        isDisabled.value = !isDisabled.value;
      };
      let arr: any[] = []
      const items = ref(arr);
      function pushData(this: any){
        const max = items.value.length + 20;
        const min = max - 20;
        if(props.connectedSites.length >= max) {
            for (let i = min; i < max; i++) {
                items.value.push(props.connectedSites[i]);
            }
        } else {
            for (let i = min; i < props.connectedSites.length; i++) {
                items.value.push(props.connectedSites[i]);
            }
        }
      }

      const loadData = (ev: { target: { complete: () => void; disabled: boolean; }; }) => {
        setTimeout(() => {
          pushData();
          ev.target.complete();

          // App logic to determine if all data is loaded
          // and disable the infinite scroll
          if (items.value.length == 100) {
            ev.target.disabled = true;
          }
        }, 500);
      };

      pushData();

      return {
        isDisabled,
        toggleInfiniteScroll,
        loadData,
        items,
        arrowBackOutline
      };
    },
})
</script>
<style scoped>
html {
  width: 200px !important;
  height: 200px !important;
}

ion-icon {
  color: white;
}
</style>