import styles from "../style.less";
import {Button, Col, Input, Layout, Row, Space} from "antd";
import React from "react";
import {Allotment} from "allotment";
import Request from "@/pages/components/Request";
import Response from "@/pages/components/Response";
import {ApiOutlined, SaveOutlined} from "@ant-design/icons";

const {Header, Content} = Layout;
export default () => {
    return (
        <Layout style={{height: '100%', backgroundColor: 'white', padding:'0px 10px'}}>
            <Header className={styles.header} style={{paddingBottom: 10}}>
                <Row gutter={5}>
                    <Col flex="auto"><Input/></Col>
                    <Col flex="160px">
                        <Space>
                            <Button type='primary' icon={<ApiOutlined />} >Send</Button>
                            <Button icon={<SaveOutlined/>}>Save</Button>
                        </Space>
                    </Col>
                </Row>
            </Header>
            <Content>
                <Allotment vertical={true}>
                    <Request/>
                    <Response/>
                </Allotment>
            </Content>
        </Layout>
    )
}
