const createResponseListener = () => {
  const callTrackingMap = {};
  const onMessageEvent = (event) => {
    const { data } = event;
    if (!data) {
      return;
    }

    const { messageId, response } = data;
    if (!messageId || !response) {
      return;
    }

    console.log("client", data);

    const callHandler = callTrackingMap[messageId];
    if (!callHandler) {
      console.error(`No handler found for message ${messageId}`);
      return;
    }

    if (response.error) {
      callTrackingMap[messageId].reject(response.error);
    } else {
      callTrackingMap[messageId].resolve(response.value);
    }

    delete callTrackingMap[messageId];
  };
  
  return {
    set: (messageId, resolve, reject) => {
      callTrackingMap[messageId] = { resolve, reject };
    },
    start: () => {
      window.addEventListener("message", onMessageEvent);
    },
    stop: () => {
      window.removeEventListener("message", onMessageEvent);
    },
  };
};

const createMessageManager = (appId, responseListener) => {
  responseListener.start();
  let messageCount = 0;

  const getUniqueMessageId = () => {
    messageCount += 1;
    return `${appId}.${messageCount}`;
  };

  const send = (message) => {
    window.parent.postMessage(message, "*");
  }

  return {
    /**
     * 
     * @param {{ functionName: string; args: any[]; }} message 
     * @param {(value: any) => void} resolve 
     * @param {(reason?: any) => void} reject 
     */
    sendMessage: (message) => {
      console.log("client", {message});
      return new Promise((resolve, reject) => {
        const messageId = getUniqueMessageId();
        const wrappedMessage = {
          ...message,
          appId,
          messageId,
        };
        responseListener.set(messageId, resolve, reject);
        send(wrappedMessage);
      });
    },
  };
};

const createAppIdManager = () => {
  let resolve;

  const appIdPromise = new Promise(r => {
    resolve = r;
  });

  return {
    getAppId: () => appIdPromise,
    setAppId: (id) => {
      resolve(id)
    },
  };
};

const createApis = () => {
  const { getAppId, setAppId } = createAppIdManager();
  const search = new URLSearchParams(window.location.search);
  const queryParamAppId = search.get("appId");
  if (queryParamAppId) {
    setAppId(queryParamAppId);
  }
  return {
    createClient: async () => {
      const appId = await getAppId();
      console.log("client", {appId});
      const responseListener = createResponseListener();
      const { sendMessage } = createMessageManager(appId, responseListener);
      const { functionNames } = await sendMessage({
        functionName: "__setup__",
        args: [],
      });

      const client = {};
      functionNames.forEach(functionName => {
        client[functionName] = (...args) => (
          sendMessage({
            functionName,
            args,
          })
        );
      });
      return client;
    },
    setAppId: (id) => {
      console.log({id});
      if (queryParamAppId) {
        console.error("Query param appId already set");
        return;
      }

      setAppId(id);
    },
  };
};

const { createClient, setAppId } = createApis();
const client = createClient();
window.getClient = () => client;
window.setAppId = setAppId;