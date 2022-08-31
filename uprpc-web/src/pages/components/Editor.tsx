import styles from "../style.less";
import {Button, Col, Form, Input, Layout, Row, Space} from "antd";
import React, {useContext, useState} from "react";
import {Allotment} from "allotment";
import Request from "@/pages/components/Request";
import Response from "@/pages/components/Response";
import {ApiOutlined, SaveOutlined} from "@ant-design/icons";
import {context, RequestProp, ResponseProp} from "@/stores/store";

const {Header, Content} = Layout;
export default (editor: any) => {

    let {store} = useContext(context)
    const getMethod = () => {
        for (let file of store.files) {
            for (let service of file.services) {
                for (let method of service.methods) {
                    if (method.id == editor.methodId) {
                        return method;
                    }
                }
            }
        }
        return {}
    }

    const [form] = Form.useForm();
    let method = getMethod()
    console.log('me', method)
    const [req, setReq] = useState(method.request)
    const [res, setRes] = useState(method.response)

    const reqChange = (value: RequestProp) => {

    }

    const resChange = (response: ResponseProp) => {

    }

    const onSend = () => {
        store.send(getValue())
    }
    const onSave = () => {

    }

    const getValue = () => {
        const host = form.getFieldValue('host')
        return {...editor, host: host, request: req, response: res}
    }

    return (
        <Layout style={{height: '100%', backgroundColor: 'white', padding: '0px 10px'}}>
            <Header className={styles.header} style={{paddingBottom: 10}}>
                <Row gutter={5}>
                    <Col flex="auto">
                        <Form form={form} initialValues={{host: editor.host}}>
                            <Form.Item name='host' noStyle><Input/></Form.Item>
                        </Form>
                    </Col>
                    <Col flex="160px">
                        <Space>
                            <Button type='primary' icon={<ApiOutlined/>} onClick={onSend}>Send</Button>
                            <Button icon={<SaveOutlined/>} onClick={onSave}>Save</Button>
                        </Space>
                    </Col>
                </Row>
            </Header>
            <Content>
                <Allotment vertical={true}>
                    <Request value={method.request} onChange={reqChange}/>
                    <Response value={method.response} onChange={resChange}/>
                </Allotment>
            </Content>

        </Layout>
    )
}
