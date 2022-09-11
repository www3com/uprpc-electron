import styles from "../style.less";
import {Button, Col, Input, Layout, Row, Space} from "antd";
import React, {useContext, useState} from "react";
import {Allotment} from "allotment";
import {ApiOutlined, PlayCircleOutlined, PoweroffOutlined, SaveOutlined, SendOutlined} from "@ant-design/icons";
import {context} from "@/stores/context";
import {observer} from "mobx-react-lite";
import Response from "@/pages/components/Response";
import Request from "@/pages/components/Request";
import {Service, Method, Mode, modeMap, Proto,} from "@/types/types";

interface EditorProp {
    proto: Proto,
    service: Service,
    method: Method
}

const editor = ({proto, service, method : initMethod}: EditorProp) => {
    let {protoStore, tabStore} = useContext(context)

    const [host, setHost] = useState(proto.host);
    const [method, setMethod] = useState(initMethod);

    const onRequestChange = (method: Method) => {
        tabStore.setDot(method.id)
        setMethod({...method, requestBody: method.requestBody, requestMetadata: method.requestMetadata});
    }

    const onHostChange = (host: string) => {
        tabStore.setDot(method.id)
        setHost(host);
    }

    const getRequestData = () => {
        return {
            id: method.id,
            body: method.requestBody,
            metadata: method.requestMetadata,
            methodMode: method.mode,
            methodName: method.name,
            namespace: service.namespace,
            serviceName: service.name,
            protoPath: proto.path,
            host: host,
        };
    }
    const onPush = async () => {
        await protoStore.push(getRequestData());
    }

    const onSend = async () => {
        await protoStore.send(getRequestData())
    }

    const onStop = async () => {
        await protoStore.stopStream(method.id);
    }

    let requestCache = protoStore.requestCaches.get(method.id);
    let responseCache = protoStore.responseCaches.get(method.id);
    // @ts-ignore
    let running: boolean = protoStore.runningCaches.get(method.id);
    return (
        <Layout style={{height: '100%', backgroundColor: 'white', padding: '0px 10px'}}>
            <Layout.Header className={styles.header} style={{paddingBottom: 10}}>
                <Row gutter={5}>
                    <Col flex="auto" style={{paddingTop: 5}}>
                        <Input addonBefore={<Space><ApiOutlined/>{modeMap[method.mode]}</Space>}
                               defaultValue={host}
                               onChange={e => onHostChange(e.target.value)}/>
                    </Col>
                    <Col flex="160px">
                        <Space>
                            {running ?
                                <Button type='primary' icon={<PoweroffOutlined/>} onClick={onStop}>Stop</Button> :
                                (method.mode == Mode.Unary ?
                                    <Button type='primary' icon={<SendOutlined/>} onClick={onSend}>Send</Button>
                                    : <Button type='primary' icon={<PlayCircleOutlined/>}
                                              onClick={onSend}>Start</Button>)}
                            <Button icon={<SaveOutlined/>}
                                    onClick={() => protoStore.save(method)}>Save</Button>
                        </Space>
                    </Col>
                </Row>
            </Layout.Header>
            <Layout.Content>
                <Allotment vertical={true}>
                    <Request running={running}
                             method={method}
                             requestCache={requestCache}
                             onChange={onRequestChange}
                             onPush={onPush}/>
                    <Response method={method} responseCache={responseCache}/>
                </Allotment>
            </Layout.Content>
        </Layout>
    )
}
export default observer(editor);