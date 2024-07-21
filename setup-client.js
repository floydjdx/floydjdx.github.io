const createResponseListener = () => {
  const callTrackingMap = {};
  const onMessageEvent = (event) => {
    const { data } = event;
    if (!data) {
      return;
    }

    const { messageId, value, error } = data;
    if (!messageId) {
      return;
    }

    const callHandler = callTrackingMap[messageId];
    if (!callHandler) {
      console.error(`No handler found for message ${messageId}`);
      return;
    }

    if (error) {
      callTrackingMap[messageId].reject(error);
    } else {
      callTrackingMap[messageId].resolve(value);
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

const createClient = async () => {
  const appId = `app${Math.round(Math.random() * 100000)}`;
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
};

const client = createClient();
window.getClient = () => client;
