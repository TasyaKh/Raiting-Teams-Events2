<template>
  <div class="form">
    <div class="wrapper-question" v-for="(form, index) in data">
      <div class="question-label">
        <div class="num-question">Вопрос {{ index + 1 }}</div>
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.required" />
          <div class="checkbox-custom"></div>
          <span class="checkbox-text">Обязательный</span>
        </label>
      </div>
      <div class="wrap-input">
        <textarea class="input-question" v-model="form.title" />
        <button class="remove-btn" @click="removeInput(index)">Удалить</button>
      </div>
    </div>
    <button class="add-btn" @click="addInput">Добавить вопрос</button>

    <button class="save-btn" @click="submit">Сохранить</button>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { onBeforeMount, ref } from "vue";
import { useFormStore } from "@/store/form_store";
import { useRoute } from "vue-router";
import { useTeamStore } from "@/store/team_store";

const route = useRoute();

const idTeam = Number(route.params.id);

let idForm: number;

const formStore = useFormStore();
const teamStore = useTeamStore();

const data = ref();
const deletedFields = ref();

const responseMsg = ref();

onBeforeMount(async () => {
  await fetchFormFields();
  deletedFields.value = [];
});

async function fetchFormFields() {
  data.value = await formStore.fetchFormFields(idTeam);
  idForm = await formStore.fetchFormId(idTeam);
}

const addInput = () => {
  if (!data.value) {
    data.value = []; // Initialize data.value as an empty array
  }
  data.value.push({ title: "", required: true });
};


const removeInput = (index: number) => {
  if (data.value && idForm) {
    deletedFields.value.push(data.value[index]);
    data.value.splice(index, 1);
  }
  else{
    data.value.splice(index, 1);
  }
};

const submit = async () => {
  const promises = [];
  console.log(idForm);

  for (let i = data.value.length - 1; i >= 0; i--) {
    const form = data.value[i];
    if (!form.title.trim()) {
      removeInput(i);
    } else 
    if (form.id == null) {
      const promise = createFormFields(form.title, idForm, form.required);
      promises.push(promise);
    }
  }

  const results = await Promise.all(promises);
  const idFields = results.filter((result) => result !== null).join("\n");


  if (idForm == undefined) {
    createForm(idTeam);
  } else {
    //updateForm(idForm, form.title, form.required);
    await archiveFields(deletedFields.value, true);
  }
  //console.log(idFields);
};



async function createFormFields(
  title: string,
  form_id: number,
  required: boolean,
) {
  responseMsg.value = "сохранено";

  try {
    const response = await axios.post("/api/forms/field", {
      title: title,
      required: required,
      form: form_id,
    });
    const strId: string = response.data.id.toString();
    //console.log(response.data.id)
    return strId;
  } catch (error: any) {
    if (error.response) {
      responseMsg.value = error.response.data.message;
    }
    return null;
  }
}

async function createForm(idTeam: number) {
  responseMsg.value = "сохранено";

  //let team = await teamStore.fetchTeam(idTeam);

  await axios
    .post("/api/forms", {
      team_id: idTeam,
    })
    .catch((err) => {
      if (err.response) {
        responseMsg.value = err.response.data.message;
      }
    });
    //console.log(team);
}

async function archiveFields(deletedFields: [], is_archive: boolean) {
  console.log("deletedFields");
  console.log(deletedFields);
  for (let i = 0; i < deletedFields.length; i++) {
    console.log(deletedFields[i]);
    let f: any = deletedFields[i];
    if (f.id) {
      await axios
        .put(`/api/forms/field/${f.id}`, {
          archive: is_archive,
        })
        .catch((err) => {
          if (err.response) {
            responseMsg.value = err.response.data.message;
          }
        });
    }
  }
}

 async function updateForm(
  index: number, 
  title: string,
  required: boolean,) {
    removeInput(index);
    createFormFields(title, index, required)
}
</script>

<style lang="scss" scoped>
.form {
  display: block;
  padding: 50px;

  .wrapper-question {
    min-height: 110px;
    margin-bottom: 30px;

    .question-label {
      display: flex;
      margin-bottom: 5px;

      .num-question {
        font-family: var(--font-family-title);
        font-weight: 700;
        font-size: 20px;

        color: rgba(0, 0, 0, 0.8);
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        margin-left: 1rem;
        font-size: 0.875rem;
        cursor: pointer;

        .checkbox-text {
          font-family: var(--font-family-title);
          font-weight: 400;
          font-size: 14px;
          text-decoration-line: line-through;
          margin-left: 5px;
          transition: color 0.2s;

          color: #a2a2a2;

          &::before {
            color: #ff502f;
          }
        }

        .checkbox-custom {
          display: inline-block;
          position: relative;
          width: 1rem;
          height: 1rem;
          border-radius: 0.3rem;
          background-color: #cdeef0;

          &:hover {
            cursor: pointer;
            background-color: #b9e6e9;
          }

          &::before {
            content: "";
            display: block;
            width: 1rem;
            height: 1rem;
            background-color: #5bd1d7;
            background-image: url(@/assets/icon/checked.svg);
            background-position: center;
            border-radius: 0.3rem;
            position: absolute;
            opacity: 0;
            transition: 0.2s;
          }
        }

        input[type="checkbox"] {
          display: none;

          &:checked ~ .checkbox-custom::before {
            opacity: 1;
            visibility: visible;
          }

          &:checked ~ .checkbox-text {
            color: #373737;
            text-decoration-line: none;
          }
        }
      }
    }

    .wrap-input {
      display: flex;
      align-items: end;

      .input-question {
        background-color: #fff;
        width: 100%;
        resize: none;
        font-family: var(--font-family-title);
        font-weight: 900;
        font-size: 14px;
        line-height: 17px;

        color: rgba(0, 0, 0, 0.8);

        &:focus {
          text-decoration-line: none;
          color: #373737;
        }
      }

      .remove-btn {
        color: white;
        border: none;
        cursor: pointer;
        max-width: 180px;
        max-height: 55px;
        margin-left: 30px;
      }
    }
  }

  .add-btn {
    display: block;
    padding: 0;
    font-family: var(--font-family-title);
    width: 230px;
    height: 60px;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
    margin: 0px auto 50px;

    color: #ffffff;
    background: var(--second-accept);
    opacity: 0.8;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 0;
    }
  }

  .save-btn {
    display: block;
    margin: 0px auto;
    font-family: var(--font-family-title);
    font-weight: 400;
    font-size: 20px;
    width: 290px;
    height: 80px;

    color: #ffffff;
    background:var(--second-accept);
  }
}
</style>
