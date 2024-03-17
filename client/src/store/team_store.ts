import { defineStore } from "pinia";
import { ref } from "vue";
import type UpdateTeam from "@/components/modals/UpdateTeam";
import type { FilterTeam } from "./models/teams/filter-teams.model";
import type { RURequisition } from "@/store/models/teams/update-requisition.model";
import axios from "axios";
import { ApiRequest } from "@/store/handleApiRequest";
import type { IRUFunction } from "./models/user/search-user-functions.model";
import type { ICreateRequisition } from "@/store/models/forms/requisition-fields.model";

export const useTeamStore = defineStore("teams", () => {
  const layout = ref(true);
  const apiRequest = new ApiRequest();
  const visits = ref([]);
  async function getUserRequisitions(id: number) {
    return (await axios.get("/api/teams/requisitions/user/" + id)).data;
  }

  async function deleteRequisition(id: number) {
    return apiRequest.handleApiRequest(async () => {
      return await axios.delete("/api/teams/requisition/" + id);
    });
  }
  async function fetchVisits(date_visit_start: string, date_visit_end: string, team_id: number) {
    const res = await axios.get("/api/schedule/visits", {
      params: {
        date_visit_start,
        date_visit_end,
        team_id,
      },
    });
    return res.data;
  }
  // data will be returned as index 0 - is data, index 1 is count
  async function fetchTeamsOfDirection(direction: number = -1) {
    const res = await axios.get("/api/teams/of-direction", {
      params: { id_parent: direction },
    });
    return res.data;
  }

  async function fetchDirections(direction: number = -1) {
    const dir = direction > 0 ? direction : null;
    const res = await axios.get("/api/teams/directions", {
      params: { id_parent: dir },
    });
    return res.data;
  }

  async function addImage(id: number, formData: FormData) {
    let responseMsg = "сохранено";
    await axios
      .post(`/api/teams/${id}/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .catch((err) => {
        if (err.response) {
          responseMsg = err.response.data.message[0];
        }
      });
    return responseMsg;
  }

  async function fetchUsersOfTeam(id: number, params: IRUFunction) {
    const res = await axios.get("/api/teams/" + id + "/users", {
      params: { ...params },
    });
    return res.data;
  }

  async function fetchTeam(id: number) {
    const res = await axios.get("/api/teams/" + id);
    return res.data;
  }

  async function createTeam(
    direction: number,
    title: string,
    description: string,
    shortname: string,
    userId: number,
    cabinet: string,
    fileUstav: File,
    fileDocument: File,
  ) {
    let responseMsg = "";

    const formData = new FormData();
    if (direction > 0) {
      formData.append("id_parent", direction.toString());
    }
    formData.append("title", title);
    formData.append("description", description);
    formData.append("shortname", shortname);
    formData.append("userID", userId.toString());
    formData.append("cabinet", cabinet);

    if (fileUstav && fileDocument) {
      formData.append(
        "files",
        fileUstav,
        `ustav.${fileUstav.name.split(".").pop()}`,
      );
      formData.append(
        "files",
        fileDocument,
        `document.${fileDocument.name.split(".").pop()}`,
      );
    } else {
      responseMsg = `вы забыли добавить файлы`;
      return responseMsg;
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    //create team
    await axios.post("api/teams", formData, config).catch((err) => {
      if (err.response) {
        responseMsg = err.response.data.message;
      }
    });

    return responseMsg;
  }

  async function createRequisition(createRequisition: ICreateRequisition) {
    return apiRequest.handleApiRequest(async () => {
      return await axios.post("/api/teams/requisitions", {
        ...createRequisition,
      });
    });
  }

  // обновить коллектив
  async function updateTeam(uT: UpdateTeam) {
    let responseMsg = "";

    const formData = new FormData();
    if (uT.id_parent > 0) {
      formData.append("id_parent", uT.id_parent.toString());
    }
    formData.append("title", uT.title);
    formData.append("description", uT.description);
    formData.append("shortname", uT.shortname);
    formData.append("cabinet", uT.cabinet);
    // paths to files
    if (uT.charterPath != null && uT.charterPath.length > 0)
      formData.append("charterTeam", uT.charterPath);
    if (uT.documentPath != null && uT.documentPath.length > 0)
      formData.append("document", uT.documentPath);

    formData.append("oldLeaderId", uT.oldUserId.toString());
    formData.append("newLeaderId", uT.newUserId.toString());

    if (uT.fileUstav != null)
      formData.append(
        "files",
        uT.fileUstav,
        `ustav.${uT.fileUstav.name.split(".").pop()}`,
      );

    if (uT.fileDocument != null)
      formData.append(
        "files",
        uT.fileDocument,
        `document.${uT.fileDocument.name.split(".").pop()}`,
      );

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const team = await axios
      .put("api/teams/" + uT.id, formData, config)
      .catch((err) => {
        if (err.response) {
          responseMsg = err.response.data.message;
        }
      });

    return { team, responseMsg };
  }

  //архивировать или нет колелктив
  async function archiveTeam(id: number, isArchive: boolean) {
    let responseMsg = isArchive ? "архивировано" : "разархивировано";
    let isOK = true;

    await axios
      .put(`api/teams/${id}/archive`, {
        isArchive: isArchive,
      })
      .catch((err) => {
        if (err.response) {
          responseMsg = err.response.data.message;
          isOK = false;
        }
      });

    return { responseMsg, isOK };
  }

  //fetch teams by some filters
  async function fetchTeamsSearch(filterTeam: FilterTeam) {
    //find by all txt data in table
    const res = await axios.get("/api/teams", {
      params: filterTeam,
    });

    return res.data;
  }

  // requisition --------------------------------------------------------------------
  //получить заявки
  async function fetchRequisitions(requisition: RURequisition) {
    return apiRequest.handleApiRequest(async () => {
      return await axios.get(
        "/api/teams/" + requisition?.team_id + "/requisition",
        {
          params: { ...requisition },
        },
      );
    });

    // const res = await axios.get("/api/teams/" + team_id + "/requisition", {
    //   params: { user_id: user_id > 0 ? user_id : null },
    // });
  }

  // обновить заявку
  async function updateRequisition(requisition: RURequisition) {
    return apiRequest.handleApiRequest(async () => {
      const { id, ...requestData } = requisition;
      return await axios.put(`/api/teams/requisition/${id}`, requestData);
    });
  }

  // TODO: обновить заявку в коллектив по ид юзера
  // update by user id
  // async function updateRequisitionByUserId(
  //     user_id: number,
  //     status_name: string,
  // ) {
  //     const res = await axios.put("/api/teams/requisition/", {
  //         status_name: status_name,
  //         user_id: user_id,
  //     });
  //
  //     return res.data;
  // }

  // requisition --------------------------------------------------------------------

  //задать нового участника
  async function assignNewParticipant(team_id: number, user_id: number) {
    const res = await axios.post("/api/teams/user-functions/new-participant", {
      user: user_id,
      team: team_id,
    });

    return res.data;
  }

  // Переключение Switch_toggle в стр. Коллективы и Мероприятия
  function setLayout(res: boolean) {
    layout.value = res;
  }

  const menu_items = [
    {
      id: 1,
      title: "Набор",
      hidden: true,
      menu_types: [
        { id: 1, title: "Набор открыт", checked: false },
        { id: 2, title: "Набор закрыт", checked: false },
      ],
    },
    {
      id: 2,
      title: "Вид деятельности",
      hidden: true,
      menu_types: [
        { id: 1, title: "Научная деятельность", checked: true },
        { id: 2, title: "Учебная деятельность", checked: true },
        { id: 3, title: "Общественная деятельность", checked: true },
        { id: 4, title: "Спортивная деятельность", checked: true },
        { id: 5, title: "Культурно-творческая деятельность", checked: true },
      ],
    },
    {
      id: 3,
      title: "Тип коллектива",
      hidden: true,
      menu_types: [
        { id: 1, title: "Архивный", checked: false },
        { id: 2, title: "Действующий", checked: true },
      ],
    },
  ];

  return {
    createTeam,
    setLayout,
    fetchTeamsOfDirection,
    fetchUsersOfTeam: fetchUsersOfTeam,
    fetchTeam,
    updateTeam,
    archiveTeam,
    deleteRequisition,
    updateRequisition,
    fetchRequisitions,
    getUserRequisitions,
    fetchVisits,
    fetchTeamsSearch,
    addImage,
    fetchDirections,
    createRequisition,

    // assign roles
    assignNewParticipant,

    layout,
    menu_items,
    apiRequest,
  };
});
