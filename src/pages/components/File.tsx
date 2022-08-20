import React from "react";
import {inject, observer} from "mobx-react";
import {Button, Layout, Space, Tabs, Tree, TreeDataNode} from "antd";
import {
    ApiOutlined, DownOutlined,
    EnvironmentOutlined,
    HddOutlined,
    PlusCircleOutlined,
    PlusOutlined,
    SettingOutlined, SmileOutlined
} from "@ant-design/icons";

const file = ({store}: any) => {
    const onClick = () => {
        store.add()
    }

    const treeData: TreeDataNode[] = [
        {
            title: 'parent 1',
            key: '0-0',
            icon: <SmileOutlined />,
            children: [
                {
                    title: 'parent 1-0',
                    key: '0-0-0',
                    icon: <SmileOutlined />,
                    children: [
                        {
                            title: 'leaf',
                            key: '0-0-0-0',
                            icon: <SmileOutlined />,
                        },
                        {
                            title: 'leaf',
                            key: '0-0-0-1',
                            icon: <SmileOutlined />,
                        },
                        {
                            title: 'leaf',
                            key: '0-0-0-2',
                            icon: <SmileOutlined />,
                        },
                    ],
                },
                {
                    title: 'parent 1-1',
                    key: '0-0-1',
                    icon: <SmileOutlined />,
                    children: [
                        {
                            title: 'leaf',
                            key: '0-0-1-0',
                            icon: <SmileOutlined />,
                        },
                    ],
                },
                {
                    title: 'parent 1-2',
                    key: '0-0-2',
                    icon: <SmileOutlined />,
                    children: [
                        {
                            title: 'leaf',
                            key: '0-0-2-0',
                            icon: <SmileOutlined />,
                        },
                        {
                            title: 'leaf',
                            key: '0-0-2-1',
                            icon: <SmileOutlined />,
                        },
                    ],
                },
            ],
        },
    ];

    const grpc = (<Space direction='vertical' size={0} align={"center"}>
        <HddOutlined style={{fontSize: 20, marginRight: 0}}/>
        <div style={{fontSize: 12}}>GRPC</div>
    </Space>)
    const env = (<Space direction='vertical' size={0}>
        <SettingOutlined style={{fontSize: 20, marginRight: 0}}/>
        <div style={{fontSize: 12}}>ENV</div>
    </Space>)

    return (
        <Layout style={{height: '100%', paddingTop: '5px'}}>
            <Layout.Header style={{padding: 0, backgroundColor: 'white', height: '40px', lineHeight: '40px', borderBottom: '1px solid #f0f0f0'}}>
                <div style={{width: '100%', display: 'flex', flexDirection:'column-reverse', alignItems:'end', justifyItems: 'end'}} >
                    <Button type='text' icon={<PlusCircleOutlined/>}>Import</Button>
                </div>
            </Layout.Header>
            <Layout.Content style={{backgroundColor: 'white'}}>
                <Tabs tabPosition='left' size='small' style={{height: '100%'}}>
                    <Tabs.TabPane tab={grpc} key="2">
                        <Tree.DirectoryTree
                            switcherIcon={<DownOutlined />}
                            defaultExpandedKeys={['0-0-0']}
                            treeData={treeData}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={env} key="3">
                        Content of Tab Pane 3
                    </Tabs.TabPane>

                </Tabs>
            </Layout.Content>
        </Layout>
    )
}

export default inject('store')(observer(file))