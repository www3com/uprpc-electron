import styles from "../style.less";
import {Button, Col, Input, Layout, Row, Space} from "antd";
import React, {useContext, useState} from "react";
import {Allotment} from "allotment";
import {ApiOutlined, PlayCircleOutlined, SaveOutlined} from "@ant-design/icons";
import {context} from "@/stores/store";
import {observer} from "mobx-react-lite";
import Response from "@/pages/components/Response";
import Request from "@/pages/components/Request";
import {Method, Mode} from "@/types/types";

const {Header, Content} = Layout;

const editor = ({pos}: { pos: string }) => {
    let {store} = useContext(context)
    let defaultHost = "127.0.0.1:9000";
    let defaultMethod: Method = {
        id: '',
        name: '',
        mode: Mode.Unary,
        requestBody: "",
    }
    if (pos.indexOf('-') > 0) {
        let posArr = pos.split('-').map(Number);
        let proto = store.protos[posArr[1]];
        let service = proto.services[posArr[2]]
        defaultHost = proto.host;
        defaultMethod = service.methods[posArr[3]]
    }


    const [host, setHost] = useState(defaultHost);
    const [method, setMethod] = useState(defaultMethod);

    const onSend = () => {
        store.send({body: method.requestBody, host: host, id: method.id, metadata: undefined})
    }

    const onSave = () => {

    }

    let requestCache = store.requestCaches.get(method.id);
    let responseCache = store.responseCaches.get(method.id);
    return (
        <Layout style={{height: '100%', backgroundColor: 'white', padding: '0px 10px'}}>
            <Header className={styles.header} style={{paddingBottom: 10}}>
                <Row gutter={5}>
                    <Col flex="auto" style={{paddingTop: 5}}>
                        <Input addonBefore={<Space><ApiOutlined/>{method.mode}</Space>}
                               defaultValue={host}
                               onChange={e => setHost(e.target.value)}/>
                    </Col>
                    <Col flex="160px">
                        <Space>
                            <Button type='primary' icon={<PlayCircleOutlined/>} onClick={onSend}>Start</Button>
                            <Button icon={<SaveOutlined/>} onClick={onSave}>Save</Button>
                        </Space>
                    </Col>
                </Row>
            </Header>
            <Content>
                <Allotment vertical={true}>
                    <Request method={method} requestCache={requestCache} onChange={(v) => setMethod(v)}/>
                    <Response method={method} responseCache={responseCache}/>
                </Allotment>
            </Content>
        </Layout>
    )
}
export default observer(editor);