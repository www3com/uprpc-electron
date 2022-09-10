import styles from "../style.less";
import {Button, Col, Input, Layout, Row, Space} from "antd";
import React, {useContext, useState} from "react";
import {Allotment} from "allotment";
import {ApiOutlined, PlayCircleOutlined, PoweroffOutlined, SaveOutlined, SendOutlined} from "@ant-design/icons";
import {context} from "@/stores/context";
import {observer} from "mobx-react-lite";
import Response from "@/pages/components/Response";
import Request from "@/pages/components/Request";
import {Method, Mode, modeMap} from "@/types/types";

const {Header, Content} = Layout;

const editor = ({pos}: { pos: string }) => {
    let {protoStore} = useContext(context)
    let defaultHost = "127.0.0.1:9000";
    let defaultMethod: Method = {
        id: '',
        name: '',
        pos:'',
        mode: Mode.Unary,
        requestBody: "",
    }
    if (pos.indexOf('-') > 0) {
        let posArr = pos.split('-').map(Number);
        let proto = protoStore.protos[posArr[1]];
        let service = proto.services[posArr[2]]
        defaultHost = proto.host;
        defaultMethod = service.methods[posArr[3]]
        defaultMethod.pos = pos;
    }


    const [host, setHost] = useState(defaultHost);
    const [method, setMethod] = useState(defaultMethod);
    const [run, setRun] = useState(false);

    const onSend = async () => {
        await protoStore.send({body: method.requestBody, host: host, id: method.id, pos: method.pos, metadata: undefined})
        // if (method.mode != Mode.Unary) {
        //     setRun(true)
        // }
    }

    const onStop = async () => {
        console.log('stop')
        await protoStore.stop()
        setRun(false)

    }
    const onSave = () => {

    }

    let sendButton = run ?
        <Button type='primary' icon={<PoweroffOutlined/>} onClick={onStop}>Stop</Button> :
        (method.mode == Mode.Unary ?
            <Button type='primary' icon={<SendOutlined/>} onClick={onSend}>Send</Button>
            : <Button type='primary' icon={<PlayCircleOutlined/>} onClick={onSend}>Start</Button>);


    let requestCache = protoStore.requestCaches.get(method.id);
    let responseCache = protoStore.responseCaches.get(method.id);
    return (
        <Layout style={{height: '100%', backgroundColor: 'white', padding: '0px 10px'}}>
            <Header className={styles.header} style={{paddingBottom: 10}}>
                <Row gutter={5}>
                    <Col flex="auto" style={{paddingTop: 5}}>
                        <Input addonBefore={<Space><ApiOutlined/>{modeMap[method.mode]}</Space>}
                               defaultValue={host}
                               onChange={e => setHost(e.target.value)}/>
                    </Col>
                    <Col flex="160px">
                        <Space>
                            {sendButton}
                            <Button icon={<SaveOutlined/>} onClick={onSave}>Save</Button>
                        </Space>
                    </Col>
                </Row>
            </Header>
            <Content>
                <Allotment vertical={true}>
                    <Request run={run} method={method} requestCache={requestCache} onChange={(v) => setMethod(v)}/>
                    <Response method={method} responseCache={responseCache}/>
                </Allotment>
            </Content>
        </Layout>
    )
}
export default observer(editor);