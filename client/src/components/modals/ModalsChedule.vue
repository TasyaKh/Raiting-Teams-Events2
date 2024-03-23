<template>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<button @click="showModal" type="button" data-bs-toggle="modal" data-bs-target="#exampleModal_2" class="custom-button">
    <i class="fas fa-pencil-alt"></i>пше 
</button>
    <div class="modal fade" id="exampleModal_2" ref="exampleModal_2" tabindex="-1" aria-labelledby="exampleModalLabel_1" aria-hidden="true" v-show="isModalVisible" :class="{ 'd-none': !isModalVisible }">
        <transition name="modal-fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <button type="button" class="btn-close" aria-label="Close" data-bs-dismiss="modal"></button>
                    <h1 class="form_title" id="exampleModalLabel_1">Редактирование расписания в коллективе "Калина"</h1>
                    <div class="form_schedule">
                        <div class="form_group_period">
                            <div class="galka_1">
                                <label class="form_label_period">Выберите дату:</label>
                                <VueDatePicker v-model="date" range class="custom-date-picker"/>
                            </div>
                        </div>

                        <div class="form_input_2-wrapper">
                            <div class="form_group_time">
                                <label class="meeting-time" for="meeting-time">Время:</label>
                                <input class="form_input_2" type="time" id="meeting-time" name="meeting-time">
                            </div>

                            <div class="form_group_time">
                                <div class="galka_3">
                                    <label class="meeting-time" for="meeting-time">Место провдения:</label>
                                    <select id="weekday" class="form_input_2" name="weekday">
                                        <option value="monday">ФОК ИРНИТУ</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form_group_time">
                                <div class="galka_3">
                                    <label class="meeting-time" for="meeting-time">Педагог:</label>
                                    <select id="weekday" class="form_input_2" name="weekday">
                                        <option value="monday">Долотова И.М.</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form_group_time">
                                <div class="galka_3">
                                    <label class="meeting-time" for="meeting-time">Вид занятия:</label>
                                    <select id="weekday" class="form_input_2" name="weekday">
                                        <option value="monday">Обязательное (внутреннее мероприятие)</option>
                                    </select>
                                </div>
                            </div>

                            <button class="button_add">+Добавить занятие</button>
                            
                            <div>
                                <!-- <button class="button_cancel" @click="closeModal">Отмена</button> -->
                                <button class="button_cancel" data-bs-dismiss="modal">Отмена</button>
                                <button class="button_save" @click="saveForm" >Сохранить</button>
                                <div id="saveNotification">Форма успешно сохранена!</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

    
<script setup lang="ts">
import { ref, nextTick } from 'vue';
import '@vuepic/vue-datepicker/dist/main.css';
import VueDatePicker from '@vuepic/vue-datepicker';

const date = ref<Date | null>(null);
const isModalVisible = ref(false);
const isFormSaved = ref(false);

function showModal() {
  isModalVisible.value = true;
}

function saveForm() {
  // Логика сохранения формы
  isFormSaved.value = true;
  showSaveNotification();

}

function showSaveNotification() {
 // Логика отображения всплывающего окна
 const notification = document.getElementById('saveNotification');
 if (notification) {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
      // Закрытие модального окна после отображения уведомления
      isModalVisible.value = false;
    }, 1500); // Вы можете настроить время задержки по своему усмотрению
 }
}
</script>
    
    <style lang="scss" scoped>
    *{
        margin: 0;
        padding: 0;
    }

    
    .custom-button {
        background-color: #0B1D57; 
        background-color: transparent;
        border: none; 
        padding: 0; 
        text-align: center; 
        text-decoration: none; 
        display: inline-block; 
        font-size: 16px; 
        margin: 4px 2px; 
        cursor: pointer; 
        color: inherit; 
        position: absolute;
        left: 70%;
    }

    .btn-close{
        position: absolute;
        float: right;
        margin: 0;
        top: 50px;
        left: 660px;
    }
    
    .modal-fade-enter,
    .modal-fade-leave-to {
        opacity: 0;
    }

    .modal-fade-enter-active,
    .modal-fade-leave-active {
        transition: opacity .5s ease;
    }

    .application-form{
        font-family: 'Montserrat';
        border-radius: 15px;
        box-shadow: 0px 0px 20px 10px rgba(0, 0, 0, 0.10);
        margin: 20px auto;
        width: 722px;
        height: 1000px;
        flex-shrink: 0;
    }

    .modal-dialog{
        position: absolute;
        left: 27%;
    }   
    
     .dp__input_wrap{
        color: red !important;
        width: 500px !important;
    } 

    .dp__pointer.dp__input_readonly.dp__input.dp__input_icon_pad.dp__input_reg{
        color: red !important;
        width: 500px !important;
    } 

    .modal-content{
        font-family: 'Montserrat';
        border-radius: 15px;
        box-shadow: 0px 0px 20px 10px rgba(0, 0, 0, 0.10);
        margin: 20px auto;
        width: 722px;
        height: 959px;
        flex-shrink: 0;
        margin-left: auto;
        margin-right: auto;
    }

    .form_title{
        padding: 40px 204px 0 203px;
        color: var(---, #383838);
        text-align: center;
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        margin: 0;
    }
    
    .form_schedule{
        padding: 30px 61px;
    }
    
    .form_label_period{
        padding: 19px 0 35px 0;
    }
    
    .form_label_day{
        margin: 0 60px 49px 0;
    }
    
    .meeting-time{
        padding: 0 0 20px 0;
    }
    
    .form_input{
        margin: 0 0 0 0;
        width: 335px;
        height: 55px;
        border-radius: 15px;
        border: 1.5px solid #cbcbcb;
        padding: 14px 14px 14px 35px;
        margin: 0 0 20px 0;
        appearance: none;
    }
    
    .form_input:focus {
      outline-color: #A6A6A6;
    }

    .custom-date-picker{
        float: right;
        width: 335px;
    }

    // .dp__main.dp__theme_light.custom-date-picker{
    //     width: 335px;
    //     height: 55px;
    //     border-radius: 15px;
    //     border: 1.5px solid #cbcbcb;
    // }

    .custom-date-picker .dp__input_wrap {
    width: 335px;
    height: 55px;
    border-radius: 15px;
    border: 1.5px solid #cbcbcb;
    }

    .dp__pointer.dp__input_readonly.dp__input.dp__input_icon_pad.dp__input_reg{
        border: 1.5px solid #cbcbcb;
        border-radius: 15px;
        padding: 14px 14px 14px 35px;
        background-color: rgba(0, 0, 0, 0);
    
    }
    //
    .dp__icon.dp__clear_icon.dp__input_icons{
        opacity: 0;
    }
    
    .galka_1{
        position: relative;
    }
    
    .galka_1::before{
        content: "";
        position: absolute;
        top: 18%;
        right: 25px;
        transform: translate(-50%);
    
        display: block;
        width: 13px;
        height: 13px;
        border: 2px solid #A6A6A6;
        border-width: 0 1.5px 1.5px 0;
        transform: rotate(45deg);
    }
    
    .galka_2{
        position: relative;
    }
    
    .galka_2::before{
        content: "";
        position: absolute;
        top: 18%;
        right: 25px;
        transform: translate(-50%);
    
        display: block;
        width: 13px;
        height: 13px;
        border: 2px solid #A6A6A6;
        border-width: 0 1.5px 1.5px 0;
        transform: rotate(45deg);
    }
    
    .galka_3{
        position: relative;
    }
    
    .galka_3::before{
        content: "";
        position: absolute;
        top: 50%;
        right: 25px;
        transform: translate(-50%);
    
        display: block;
        width: 13px;
        height: 13px;
        border: 2px solid #A6A6A6;
        border-width: 0 1.5px 1.5px 0;
        transform: rotate(45deg);
    }
    
    .form_input_2{
        margin: 0 0 0 0;
        width: 600px;
        height: 55px;
        border-radius: 15px;
        border: 1.5px solid #cbcbcb;
        padding: 14px 24px 14px 35px;
        margin: 0 0 20px 0;
        appearance: none;
    }
    
    .form_input_2:focus{
        cursor: pointer;
        outline-color: #A6A6A6; 
    }
    
    .form_input_2-wrapper{
        position: relative;
    }
    
    .form_input_2-wrapper::before{
        position: absolute;
        height: 8px;
        width: 8px;
        z-index: 3;
        background-color: red;
    }
    
    .button_add{
        margin: 10px 0 0 0;
        padding: 13px 17px;
        border-radius: 10px;
        color: black;
        background-color: white;
        border: 1.5px solid #cbcbcb;
    }
    
    .button_add:hover{
        cursor: pointer;
        border: 1.5px solid #A6A6A6;
    }
    
    .button_cancel{
        margin: 50px 0 0 161px;
        padding: 13px 17px;
        border-radius: 10px;
        color: black;
        background-color: white;
        border: 1.5px solid white;
    }
    
    .button_cancel:hover{
        cursor: pointer;
        border: 1.5px solid #A6A6A6;
    }
    
    .button_save{
        margin: 0px 0 0 40px;
        padding: 13px 17px;
        border-radius: 10px;
        color: black;
        background-color: white;
        border: 1.5px solid white;
    }
    
    .button_save:hover{
        cursor: pointer;
        border: 1.5px solid #A6A6A6;
    }

    #saveNotification {
        display: none;
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
    }

    #saveNotification.show {
        display: block;
    }

    </style>
