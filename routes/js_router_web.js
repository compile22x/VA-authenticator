"use strict";


var v_router = require('./js_router');
const C = global.c_CONSTANTS;

v_router.m_Router.post(C.CONST_WEB_FUNCTION + C.CONST_WEB_LOGIN_COMMAND, function (v_req, v_response, v_next) {

    try {
        console.log("[" + new Date().toLocaleString("en-US",{timeZone:"America/New_York",hour12:false}) + " EST" + "] [INFO ] [AUTH] Login request received");

        //https://github.com/expressjs/express/issues/3264
        Object.setPrototypeOf(v_req.body, {});

        const c_body = v_req.body;
        // extract parameter values from header... no verification check here.
        if (c_body.hasOwnProperty(C.CONST_ACCOUNT_NAME_PARAMETER) === false) {
            v_router.fn_errorPage(v_response);
            return;
        }
        if (c_body.hasOwnProperty(C.CONST_ACCESS_CODE_PARAMETER) === false) {
            v_router.fn_errorPage(v_response);
            return;
        }
        if (c_body.hasOwnProperty(C.CONST_APP_GROUP_PARAMETER) === false) {
            v_router.fn_errorPage(v_response);
            return;
        }
        if (c_body.hasOwnProperty(C.CONST_APP_NAME_PARAMETER) === false) {
            v_router.fn_errorPage(v_response);
            return;
        }
        if (c_body.hasOwnProperty(C.CONST_APP_VER_PARAMETER) === false) {
            v_router.fn_errorPage(v_response);
            return;
        } if (c_body.hasOwnProperty(C.CONST_EXTRA_PARAMETER) === false) {
            v_router.fn_errorPage(v_response);
            return;
        }


        // call server API
        var ret = global.m_authServer.fn_newLoginCard(
            c_body[C.CONST_ACCOUNT_NAME_PARAMETER],
            c_body[C.CONST_ACCESS_CODE_PARAMETER],
            'g',
            c_body[C.CONST_APP_GROUP_PARAMETER],
            c_body[C.CONST_APP_NAME_PARAMETER],
            c_body[C.CONST_APP_VER_PARAMETER],
            c_body[C.CONST_EXTRA_PARAMETER],
            true,
            function (p_data) {

                // you cannot login as AGENT on this service .. something wrong ... a hacking attempt
                //if (p_data[C.CONST_ACTOR_TYPE.toString()] !== C.CONST_GCS)
                //{
                //    v_router.fn_errorPage (v_response);
                //}
                // MHEFNY LATER
                if (v_response.writableEnded === true) return;
                p_data[C.CONST_COMMAND.toString()] = C.CONST_WEB_LOGIN_COMMAND;
                v_response.json(p_data);

                const _e = (p_data && p_data.e !== undefined) ? p_data.e : "?";
                const _key = (p_data && p_data.cs && p_data.cs.f) ? ("..." + p_data.cs.f.slice(-8)) : "";
                const _em = (p_data && p_data.em) ? (" em=" + p_data.em) : "";
                console.log("[" + new Date().toLocaleString("en-US",{timeZone:"America/New_York",hour12:false}) + " EST" + "] [INFO ] [AUTH] Login " + (_e===0 ? "OK key=" + _key : "FAIL e=" + _e + _em));

            },
            function () {
                v_router.fn_errorPage(v_response);
            });
    }
    catch (ex) {
        v_router.fn_errorPage(v_response);
    }

});


v_router.m_Router.post(C.CONST_WEB_FUNCTION + C.CONST_ACCOUNT_MANAGMENT, function (v_req, v_response, v_next) {

    try {
        console.log("[" + new Date().toLocaleString("en-US",{timeZone:"America/New_York",hour12:false}) + " EST" + "] [INFO ] [AUTH] Account management request");

        //https://github.com/expressjs/express/issues/3264
        Object.setPrototypeOf(v_req.body, {});

        const c_body = v_req.body;
        if (v_req.body[C.CONST_SUB_COMMAND.toString()] == null) {
            v_router.fn_errorPage(v_response);
            return;
        }
        if (v_req.body[C.CONST_ACCOUNT_NAME_PARAMETER.toString()] == null) {
            v_router.fn_errorPage(v_response);
            return;
        }

        if (v_req.body[C.CONST_PERMISSION_PARAMETER.toString()] == null) {
            v_req.body[C.CONST_PERMISSION_PARAMETER] = '0xffffffff';
        }
        global.m_authServer.fn_accountOperation(v_req.body[C.CONST_SUB_COMMAND],
            v_req.body[C.CONST_ACCOUNT_NAME_PARAMETER],
            v_req.body[C.CONST_PERMISSION_PARAMETER],
            v_req.body[C.CONST_ACCESS_CODE_PARAMETER],
            function (p_data) {
                if (v_response.writableEnded === true) return;

                p_data[C.CONST_COMMAND.toString()] = C.CONST_ACCOUNT_MANAGMENT;
                v_response.json(p_data);

            },
            function () {
                v_router.fn_errorPage(v_response);
            },
            v_req.body[C.CONST_SESSION_ID]
        );
    }
    catch (ex) {
        v_router.fn_errorPage(v_response);
    }
});



v_router.m_Router.post(C.CONST_WEB_FUNCTION + C.CONST_WEB_LOGOUT_COMMAND, function (v_req, v_response, v_next) {
    
    try {
        
        console.log("[" + new Date().toLocaleString("en-US",{timeZone:"America/New_York",hour12:false}) + " EST" + "] [INFO ] [AUTH] Logout request");

        // Sanitize request body
        Object.setPrototypeOf(v_req.body, {});

        const c_body = v_req.body;
        // Validate session ID
        if (!c_body[C.CONST_SESSION_ID]) {
            const response = {
                [C.CONST_ERROR]: C.CONST_ERROR_SESSION_NOT_FOUND,
                [C.CONST_ERROR_MSG]: 'Invalid or missing session ID',
                [C.CONST_COMMAND]: C.CONST_WEB_LOGOUT_COMMAND
            };
            v_response.json(response);
            return;
        }

        // Call fn_logout from js_auth_server.js
        global.m_authServer.fn_logout(
            c_body[C.CONST_SESSION_ID],
            function (p_data) {
                // Success callback
                p_data[C.CONST_COMMAND] = C.CONST_WEB_LOGOUT_COMMAND;
                v_response.json(p_data);
            },
            function () {
                // Error callback
                const response = {
                    [C.CONST_ERROR]: C.CONST_ERROR_SESSION_NOT_FOUND,
                    [C.CONST_ERROR_MSG]: 'Session not found or invalid',
                    [C.CONST_COMMAND]: C.CONST_WEB_LOGOUT_COMMAND
                };
                v_response.json(response);
            }
        );
    } catch (ex) {
        console.error('Logout error:', ex);
        const response = {
            [C.CONST_ERROR]: C.CONST_ERROR_UNKNOWN,
            [C.CONST_ERROR_MSG]: 'Server error during logout',
            [C.CONST_COMMAND]: C.CONST_WEB_LOGOUT_COMMAND
        };
        v_response.json(response);
    }

});

module.exports = v_router.m_Router;