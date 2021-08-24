export const constantApis = {
    //settings  
    getSettings: '/api/settings',

    //login
    sendOtp: '/web/sendOtp',
    updateName: '/web/updateName',
    qrCode: '/web/webLogin',
    qrUserData: '/web/qrData',

    //chat
    singleChatDetails: '/web/getUserChats',
    groupChatDetails: '/web/getDetailedChat',
    chatList: '/web/chatList',
    addGrpMembers: '/api/AddGrpMembers',

    //grpTalk
    guestUser: '/guest/addUser',
    uploadGuestExcel: '/guest/userExcelUpload',

    //socket
    socketConnect: '/web/closeSocket'
}
