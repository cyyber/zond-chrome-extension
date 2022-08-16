<template>
    <ion-app>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title size="large">Welcome</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true" class="ion-padding">
            <ion-list>
                <ion-item v-if="new_user">
                    <ion-input placeholder="Username" v-model="username"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input type="password" placeholder="Password" v-model="password"></ion-input>
                </ion-item>

                <ion-item v-if="new_user">
                    <ion-input type="password" placeholder="Confirm password"></ion-input>
                </ion-item>

            </ion-list>

            <ion-button expand="block" v-on:click="submit">Submit</ion-button>
        </ion-content>
    </ion-page>
    </ion-app>
</template>
<script lang="ts">
import { IonApp, IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonTitle, IonItem, IonInput, IonList } from "@ionic/vue";
import UUID from "uuidjs";
import { storefrontSharp } from "ionicons/icons";
import { defineComponent } from "vue";
import {setStore} from '../../store/ionic-storage'
import {ref} from 'vue'

// import { useRouter } from "vue-router";

// const router = useRouter()

export default defineComponent({
    name: "Login-flow",
    data() {
        return {
            username: '',
            password:'',
            new_user: new Boolean
        }
    },
    components: {
        IonApp,
        IonPage,
        IonHeader,
        IonToolbar,
        IonContent,
        IonButton,
        IonTitle,
        IonInput,
        IonItem,
        IonList,
    },
    
    beforeMount() {
        this.isNewUser()
    },
    methods: {
        async submit() {
            var store = await setStore()
            if(this.new_user) {
                const user_id = UUID.generate()
                var account_obj = {
                    username: this.username,
                    wallet: []
                }
                console.log("username is", this.username)
                await store.set(this.password, user_id)
                await store.set(user_id, account_obj)
                this.$router.push({path: `/app/${user_id}`})
                return
            }
            var id = await store.get(this.password)
            var user_details = await store.get(id)
            if(user_details.username) {
                this.$router.push({path: `/app/${id}`})
                return
            }
            // this.$router.push({path: '/login'})
        },
        async isNewUser() {
            var store = await setStore()
            var store_len = await store.length()
        
            this.new_user = store_len == 0   
        }
    },
    setup() {
        var username = ref('')
        var password = ref('')
    }
})

</script>