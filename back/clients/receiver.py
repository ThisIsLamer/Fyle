import json
import random
import time

from websockets.sync.client import connect

print('receiver start')

with connect('ws://localhost:8000', max_size=1000*1024*1024) as ws:
    data: dict = json.loads(ws.recv(timeout=1000.0))
    print(data)
    myId = data['result']['clientId']

    print()
    print(f'My ID: {myId}')
    print()
    print('waiting sender')

    data: dict = json.loads(ws.recv(timeout=1000.0))
    print(data)

    session: dict = data['result']['session']
    print(f'Receiving {session["fileName"]} {session["fileSize"]} bytes')

    f = open(session["fileName"], 'wb')

    saved = 0

    while True:
        data: dict | bytes = ws.recv()
        if isinstance(data, bytes):
            session_id = int.from_bytes(data[:4])
            block_id = int.from_bytes(data[4:8])
            block = data[8:]
            print(f'saved block [{block_id}]', block[:15].hex(' '), len(block))
            saved += 1

            f.write(block)

            if saved % 10 == 0:
                ws.send(json.dumps({
                    'id': 100,
                    'method': 'blockReceived',
                    'params': {
                        'sessionId': session['id'],
                        'block': block_id
                    }
                }))

            if saved == session['blockCount']:
                print('all blocks received')
                break

    f.close()

    time.sleep(1000)
    pass

