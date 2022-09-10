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

interface EditorProp {
    pos: string
}

const editor = ({pos}: EditorProp) => {
    let {protoStore, tabStore} = useContext(context)
    const init = () => {
        let fullMethod = {host: '127.0.0.1:9000', method: {id: '1', name: '', mode: Mode.Unary, requestBody: '{}'}}
        if (pos.indexOf('-') > 0) {
            let posArr = pos.split('-').map(Number);
            let proto = protoStore.protos[posArr[1]];
            let service = proto.services[posArr[2]]
            return {method: service.methods[posArr[3]], host: proto.host};
        }
        console.log('edit init full method: ', fullMethod)
        return fullMethod;
    }

    const [fullMethod, setFullMethod] = useState(init);
    const [run, setRun] = useState(false);

    const onRequestChange = (method: Method) => {
        tabStore.setDot(method.id)
        setFullMethod({...fullMethod, method: method});
    }

    const onHostChange = (host: string) => {
        tabStore.setDot(fullMethod.method.id)
        setFullMethod({...fullMethod, host: host});
    }

    const onPush = async () => {
        await protoStore.push({
            body: fullMethod.method.requestBody,
            host: fullMethod.host,
            id: fullMethod.method.id,
            metadata: undefined
        });
    }

    const onSend = async () => {
        await protoStore.send({
            body: fullMethod.method.requestBody,
            host: fullMethod.host,
            id: fullMethod.method.id,
            metadata: undefined,
            pos: pos
        })
        if (fullMethod.method.mode != Mode.Unary) {
            setRun(true)
        }
    }

    const onStop = async () => {
        await protoStore.stop(fullMethod.method.id);
        setRun(false);
    }

    let requestCache = protoStore.requestCaches.get(fullMethod.method.id);
    let responseCache = protoStore.responseCaches.get(fullMethod.method.id);
    return (
        <Layout style={{height: '100%', backgroundColor: 'white', padding: '0px 10px'}}>
            <Layout.Header className={styles.header} style={{paddingBottom: 10}}>
                <Row gutter={5}>
                    <Col flex="auto" style={{paddingTop: 5}}>
                        <Input addonBefore={<Space><ApiOutlined/>{modeMap[fullMethod.method.mode]}</Space>}
                               defaultValue={fullMethod.host}
                               onChange={e => onHostChange(e.target.value)}/>
                    </Col>
                    <Col flex="160px">
                        <Space>
                            {run ?
                                <Button type='primary' icon={<PoweroffOutlined/>} onClick={onStop}>Stop</Button> :
                                (fullMethod.method.mode == Mode.Unary ?
                                    <Button type='primary' icon={<SendOutlined/>} onClick={onSend}>Send</Button>
                                    : <Button type='primary' icon={<PlayCircleOutlined/>}
                                              onClick={onSend}>Start</Button>)}
                            <Button icon={<SaveOutlined/>}
                                    onClick={() => protoStore.save(fullMethod.method)}>Save</Button>
                        </Space>
                    </Col>
                </Row>
            </Layout.Header>
            <Layout.Content>
                <Allotment vertical={true}>
                    <Request run={run}
                             method={fullMethod.method}
                             requestCache={requestCache}
                             onChange={onRequestChange}
                             onPush={onPush}/>
                    <Response method={fullMethod.method} responseCache={responseCache}/>
                </Allotment>
            </Layout.Content>
        </Layout>
    )
}
export default observer(editor);