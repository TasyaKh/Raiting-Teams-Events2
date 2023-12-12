<template>
  <div class="form">
    <div
      class="wrapper-question"
      v-for="(field, index) in fields"
      v-bind:key="index"
    >
      <div class="question-label">
        <div class="num-question">Вопрос {{ index + 1 }}</div>
        <label class="checkbox-label">
          <input type="checkbox" v-model="field.required" />
          <div class="checkbox-custom"></div>
          <span class="checkbox-text">Обязательный</span>
        </label>
      </div>
      <div class="wrap-input">
        <textarea class="input-question" v-model="field.title" />
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
import type { IFormField } from "@/store/models/forms/form-field.model";
import type { Ref } from "vue";

const route = useRoute();

const idTeam = Number(route.params.id);

let idForm: number;

const formStore = useFormStore();

const fields: Ref<IFormField[]> = ref([]);
const deletedFields = ref();

const responseMsg = ref();

onBeforeMount(async () => {
  await fetchFormFields();
  deletedFields.value = [];
});

async function fetchFormFields() {
  fields.value = (await formStore.fetchFormFields(idTeam)) as IFormField[];
  idForm = await formStore.fetchFormId(idTeam);
}

const addInput = () => {
  if (!fields.value) {
    fields.value = []; // Initialize data.value as an empty array
  }
  fields.value.push({ title: "", required: true });
};

const submit = async () => {
  const promises = [];

  for (let i = fields.value.length - 1; i >= 0; i--) {
    const field = fields.value[i];

    if (field.id == null && field.title && field.required) {
      const promise = createFormFields(field.title, idForm, field.required);
      promises.push(promise);
    }
  }

  if (idForm == undefined) {
    await createForm(idTeam);
  } else {
    await archiveFields(deletedFields.value, true);
    // updateForm(idForm)
  }
};

const removeInput = (index: number) => {
  if (fields.value[index]) {
    deletedFields.value.push(fields.value[index]);
    fields.value.splice(index, 1);
  }
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
    return response.data.id.toString();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      responseMsg.value = error.response?.data.message;
    }
    return null;
  }
}

async function createForm(idTeam: number) {
  responseMsg.value = "сохранено";

  await axios
    .post("/api/forms", {
      team_id: idTeam,
    })
    .catch((err) => {
      if (err.response) {
        responseMsg.value = err.response.data.message;
      }
    });
}

async function archiveFields(deletedFields: IFormField[], is_archive: boolean) {
  for (const element of deletedFields) {
    let f = element;
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
    background: var(--second-accept);
  }
}
</style>
