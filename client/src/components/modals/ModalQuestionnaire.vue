<template>
  <button
    v-if="userReq == null || userReq.length <= 0"
    type="button"
    data-bs-toggle="modal"
    data-bs-target="#exampleModal"
  >
    Подать заявку
  </button>
  <div v-else class="">
    Заявка "{{ userReq[0].status ? userReq[0].status.name : "Подана" }}"
    <FontAwesomeIcon icon="feather" />
  </div>

  <!-- Modal -->
  <div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-title" id="exampleModalLabel">Заполните анкету</div>
        <div class="modal-subtitle" :value="modelValue">{{ modelValue }}</div>
        <div v-for="form in data" class="wrapper-questions">
          <div class="wrapper-one-question">
            <div class="question-label">
              {{ form.title }}{{ form.required ? "*" : "" }}
            </div>
            <textarea class="input-answer" />
          </div>
        </div>
        <div class="wrap-button">
          <button type="button" class="close-btn" data-bs-dismiss="modal">
            Закрыть
          </button>
          <button class="send-btn" @click="send">Отправить ответы</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useFormStore } from "@/store/form_store";
import { useRoute } from "vue-router";
import { useTeamStore } from "@/store/team_store";
import { usePermissionsStore } from "@/store/permissions_store";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import axios from "axios";

const permissions_store = usePermissionsStore();

const teamStore = useTeamStore();
const route = useRoute();

const idTeam = Number(route.params.id);

const formStore = useFormStore();
const userReq = ref(); //проверить не подавал ли уже юзер заявку в этот колелктив
const data = ref();
const responseMsg = ref();

defineProps({
  modelValue: {
    type: String,
  },
});

onBeforeMount(async () => {
  fetchFormFields();
  fetchRequisition(); //проверить не подавал ли уже юзер заявку в этот колелктив
});

async function fetchFormFields() {
  data.value = await formStore.fetchFormFields(idTeam);
}

const send = async () => {
  
  console.log(idTeam);
  console.log(userReq.value);
  console.log(data.value);

  createRequisition(idTeam, userReq.value, data.value.title)
};

async function createRequisition(idTeam: number, user_id: number, fields: string[]) {
  responseMsg.value = "сохранено";

  await axios
    .post("/api/teams/requisitions/new", {
      userId: user_id,
      teamId: idTeam,
      fields: fields
    })
    .catch((err) => {
      if (err.response) {
        responseMsg.value = err.response.data.message;
      }
    });
    //console.log(team);
}

async function checkRequired() {}

async function fetchRequisition() {
  userReq.value = await teamStore.fetchRequisitions(
    idTeam,
    permissions_store.user_id,
  );
}

//  export default {
//   name: "ModalQuestionnaire",
//   props: {
//     inputs: {
//       type: Array,
//       required: true,
//     },
//   },
//   data() {
//     return {
//       formValues: [],
//     };
//   },
//   methods: {
//     onSubmit() {
//       const requiredFields = this.inputs.filter((input) => input.required);
//       const hasEmptyFields = requiredFields.some((field, index) => !this.formValues[index]);
//     },
//   },
//  };
</script>

<style lang="scss" scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.8);

  .modal-dialog {
    width: 100%;
    max-width: 900px;

    .modal-content {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
      padding: 40px 55px 40px 55px;
      box-sizing: border-box;

      .modal-title {
        font-weight: 400;
        font-size: 36px;
        color: var(--second-color);
      }

      .modal-subtitle {
        font-weight: 400;
        font-size: 20px;
        color: rgba(0, 0, 0, 0.8);
        margin-top: 6px;
      }

      .wrapper-questions {
        margin-top: 16px;

        .question-label {
          margin-top: 40px;
          font-weight: 400;
          font-size: 20px;
          line-height: 24px;
          color: rgba(0, 0, 0, 0.8);
        }

        .input-answer {
          margin-top: 6px;
          background-color: #fff;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.15);
          border-radius: 5px;
          width: 100%;
          resize: none;
          font-weight: 400;
          font-size: 14px;
          line-height: 17px;

          color: rgba(0, 0, 0, 0.8);
        }
      }

      .wrap-button {
        align-items: end;
        margin-top: 40px;
        display: flex;
        justify-content: space-between;

        .close-btn {
          border-radius: 10px;
          color: white;
          cursor: pointer;
          width: 225px;
          height: 55px;
        }

        .send-btn {
          font-weight: 400;
          font-size: 20px;
          width: 290px;
          height: 80px;

          color: #ffffff;
          background: var(--second-accept);
          border-radius: 10px;

          //&:focus {
          //  outline: none;
          //  box-shadow: 0 0 0 2px #348498;
          //}
        }
      }
    }
  }
}
</style>
