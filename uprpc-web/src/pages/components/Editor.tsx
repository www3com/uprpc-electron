import styles from "../style.less";
import {Button, Col, Form, Input, Layout, Row, Space, Table, Tabs} from "antd";
import React, {useContext, useState} from "react";
import {Allotment} from "allotment";
import {SaveOutlined, SendOutlined} from "@ant-design/icons";
import {context} from "@/stores/store";
import {FullMethod} from "@/types/types";
import {observer} from "mobx-react-lite";
import Response from "@/pages/components/Response";
import Request from "@/pages/components/Request";

const {Header, Content} = Layout;
const editor = ({methodId}: { methodId: string }) => {

    let {store} = useContext(context)

    const getMethod = (id: string): FullMethod => {
        for (let fullMethod of store.fullMethods) {
            if (fullMethod.id == id) {
                return fullMethod;
            }
        }

        return {
            id: '',
            name: '',
            requestBody: '',
            host: '127.0.0.1:9000',
            path: '',
            namespace: '',
            service: '',
        };
    }
    const method = getMethod(methodId)

    // const [requestBody, setRequestBody] = useState(method.requestBody)
    // const [responseBody, setResponseBody] = useState(store.responses[methodId])
    const [host, setHost] = useState(method.host);
    // const reqChange = (value: RequestProp) => {
    //
    // }
    //
    // const resChange = (response: ResponseProp) => {
    //
    // }
    // console.log("editor, ", methodId,  responseBody)

    const onSend = () => {
        store.send(getValue())
    }
    const onSave = () => {

    }

    const getValue = () => {
        return {...method, host: host, requestBody: method.requestBody, responseBody: store.responses[methodId]}
    }

    const columns = [
        {title: 'Key', dataIndex: 'key', key: 'key'},
        {title: 'Value', dataIndex: 'value', key: 'value'}
    ];
    return (
        <Layout style={{height: '100%', backgroundColor: 'white', padding: '0px 10px'}}>
            <Header className={styles.header} style={{paddingBottom: 10}}>
                <Row gutter={5}>
                    <Col flex="auto">
                        <Input defaultValue={method.host}
                               onChange={e => setHost(e.target.value)}/>
                    </Col>
                    <Col flex="160px">
                        <Space>
                            <Button type='primary' icon={<SendOutlined/>} onClick={onSend}>Send</Button>
                            <Button icon={<SaveOutlined/>} onClick={onSave}>Save</Button>
                        </Space>
                    </Col>
                </Row>
            </Header>
            <Content>
                <Allotment vertical={true}>
                    <Request body={JSON.stringify(method.requestBody, null, 2)}/>

                    <Response body={JSON.stringify(store.responses[methodId], null, "\t")}/>

                </Allotment>
            </Content>
        </Layout>
    )
}
export default observer(editor);