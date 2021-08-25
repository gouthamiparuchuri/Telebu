export const constantApis = {
    //settings
    getSettings: '/api/settings',

    //login
    sendOtp: '/web/sendOtp',
    updateName: '/web/updateName',
    qrCode: '/web/webLogin',
    qrUserData: '/api/v1/qrData',

    //chat
    singleChatDetails: '/api/v1/getUserChats',
    groupChatDetails: '/api/v1/getGroupChats',
    chatList: '/api/v1/chatList',
    newChatList: '/api/v1/getNewChats',

    //call
    scheduleList: '/api/v1/scheduleList',
    callList: '/api/v1/callList',

    //token
    getToken: '/api/getToken'
}
