import json
import os
import time

from websockets.sync.client import connect

f = input('file path: ') or r"E:\Downloads\xiaomi.eu_multi_HOUJI_OS1.0.24.1.22.DEV_os1-14.zip"
dst_id = int(input('dst id: '))

fn = f[f.rfind('\\') + 1:]
fs = os.path.getsize(f)

fd = open(f, 'rb')

print('sender start')

with connect('ws://localhost:8000', max_size=1000*1024*1024) as ws:
    data: dict = json.loads(ws.recv(timeout=1000.0))
    print(data)
    myId = data['result']['clientId']

    ws.send(json.dumps({
        'id': 100,
        'method': 'createSession',
        'params': {
            'fileName': fn,
            'fileSize': fs,
            'destination': dst_id,
        },
    }))
    data: dict = json.loads(ws.recv(timeout=1000.0))
    print(data)

    session: dict = data['result']['session']

    def check_apply_message(_session):
        try:
            _msg = json.loads(ws.recv(timeout=0))
        except TimeoutError:
            return

        if _msg['method'] == '_sessionChanged':
            _session |= _msg['result']['session']
            print(f'Session updated: {_session}, {blockTransmit}')


    blockTransmit = 0

    while blockTransmit < session['blockCount']:
        check_apply_message(session)

        if not session['pauseReceiving']:
            session_id = session['id']
            block_num = blockTransmit
            block = fd.read(session['blockSize'])
            block_s = bytes([*session_id.to_bytes(4), *block_num.to_bytes(4), *block])

            print('sended', block[:15].hex(' '), len(block_s))
            ws.send(block_s)
            blockTransmit += 1
        else:
            time.sleep(0.05)  # чтоб слишком много хлама в логах не было
            print('|', end='')

    pass


