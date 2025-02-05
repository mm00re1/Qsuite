/**
 * Opens a WebSocket connection, listens for messages, and resolves
 * when the desired number of messages have been received OR the timeout is reached.
 *
 * @param {string} baseUrl       - Your base server URL, e.g. "http://localhost:8000"
 * @param {string} groupId       - The UUID for the TestGroup
 * @param {string[]} subParams   - Array of parameters (e.g. ["trade", "TSLA"]) 
 * @param {number} numberOfMessages - How many messages to wait for
 * @param {number} subTimeout    - Max seconds to allow before timing out
 * @param {string} [subName="defaultSub"] - Name of the q subscription function to call (if your server requires it)
 *
 * @returns {Promise<{success: boolean, message: string, data: any[]}>}
 */
export const subscribeToKdb = (baseUrl, groupId, subParams, numberOfMessages, subTimeout, onMessageHandler, subName = 'defaultSub') => {
    return new Promise((resolve, reject) => {
      let receivedData = []
      let timerId
  
      // Convert HTTP(S) to WS(S)
      const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws'
      const baseDomain = baseUrl.replace(/^https?:\/\//, '') // strip off http:// or https://
  
      // Construct up to 8 paramX query params
      // For example, if subParams = ["trade","TSLA"], we get "?param1=trade&param2=TSLA"
      const paramString = subParams
        .map((p, i) => `param${i + 1}=${encodeURIComponent(p)}`)
        .join('&')
  
      // Final WS URL example:
      //   ws://localhost:8000/live?group_id=<UUID>&subName=mySub&param1=trade&param2=TSLA
      const wsUrl = `${wsProtocol}://${baseDomain}/live?group_id=${groupId}&sub_name=${subName}${paramString ? '&' + paramString : ''}`
      console.log("wsUrl: ", wsUrl)
      const ws = new WebSocket(wsUrl)
  
      // If a timeout was specified, set a timer
      if (subTimeout > 0) {
        timerId = setTimeout(() => {
          console.warn(`Subscription timed out after ${subTimeout} seconds`)
          ws.close();
          resolve({
            success: false,
            message: `Subscription timed out after ${subTimeout} seconds`,
            //data: receivedData,
          });
        }, subTimeout * 1000);
      }
  
      ws.onopen = () => {
        console.log('WebSocket opened:', wsUrl)
      };
  
      ws.onmessage = (event) => {
        // Ignore keepalive messages
        if (event.data === 'KEEPALIVE') return
  
        try {
          const parsedMsg = JSON.parse(event.data)
          onMessageHandler(parsedMsg)
          //console.log(parsedMsg)
          receivedData.push(parsedMsg)
          //console.log(parsedMsg)
  
          // If we've reached the target # of messages, resolve early
          if (receivedData.length >= numberOfMessages) {
            if (timerId) clearTimeout(timerId)
            ws.close()
            resolve({
              success: true,
              message: `Received desired number of messages (${numberOfMessages}).`,
              //data: receivedData,
            });
          }
        } catch (err) {
          console.error('Error parsing WS message:', err)
        }
      };
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        // You could reject here, or handle differently
      };
  
      ws.onclose = () => {
        console.log('WebSocket closed')
        // If closed *before* we got all messages, we still resolve with what we have
        if (receivedData.length < numberOfMessages) {
          resolve({
            success: false,
            message: `WebSocket closed after receiving ${receivedData.length}/${numberOfMessages} messages.`,
            //data: receivedData,
          })
        }
      }
    })
}
