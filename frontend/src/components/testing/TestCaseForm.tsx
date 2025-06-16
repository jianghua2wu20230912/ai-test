import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Col, Row } from 'antd';
import {
  TestCase,
  TestCaseCreate,
  TestCaseUpdate,
  TestCaseStatus,
  TestCasePriority,
  TestCaseType,
  TestCaseStatusType,
  TestCasePriorityType,
  TestCaseTypeType,
} from '../../types/testManagement';

const { Option } = Select;

interface TestCaseFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: TestCaseCreate | TestCaseUpdate) => void;
  initialValues?: TestCase | null;
  loading?: boolean;
  testPointId?: number | null; // To associate with a test point if creating
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({
  visible,
  onCancel,
  onFinish,
  initialValues,
  loading = false,
  testPointId,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          title: initialValues.title,
          steps: initialValues.steps || '',
          expected_result: initialValues.expected_result || '',
          status: initialValues.status || TestCaseStatus[0], // Default to 'new'
          priority: initialValues.priority || TestCasePriority[1], // Default to 'medium'
          type: initialValues.type || TestCaseType[0], // Default to 'positive'
        });
      } else {
        // Default values for new test case
        form.resetFields();
        form.setFieldsValue({
            status: TestCaseStatus[0], // 'new'
            priority: TestCasePriority[1], // 'medium'
            type: TestCaseType[0], // 'positive'
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!initialValues && testPointId) {
        // For creation, add test_point_id
        onFinish({ ...values, test_point_id: testPointId });
      } else {
        // For update
        onFinish(values as TestCaseUpdate);
      }
    } catch (errorInfo) {
      console.log('Form validation Failed:', errorInfo);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Test Case' : 'Create New Test Case'}
      open={visible}
      onCancel={onCancel}
      width={720} // Wider modal for more fields
      confirmLoading={loading}
      footer={[
        <Button key="back" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {initialValues ? 'Save Changes' : 'Create'}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="test_case_form">
        <Form.Item
          name="title"
          label="Test Case Title"
          rules={[{ required: true, message: 'Please input the test case title!' }]}
        >
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select placeholder="Select status">
                {TestCaseStatus.map(s => <Option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
              <Select placeholder="Select priority">
                {TestCasePriority.map(p => <Option key={p} value={p}>{p.toUpperCase()}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="type" label="Type">
              <Select placeholder="Select type (optional)">
                {TestCaseType.map(t => <Option key={t} value={t}>{t.toUpperCase()}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="steps"
          label="Test Steps"
          rules={[{ required: true, message: 'Please input the test steps!' }]}
        >
          <Input.TextArea rows={4} placeholder="Describe the steps to execute this test case." />
        </Form.Item>
        <Form.Item
          name="expected_result"
          label="Expected Result"
          rules={[{ required: true, message: 'Please input the expected result!' }]}
        >
          <Input.TextArea rows={3} placeholder="Describe the expected outcome after executing the steps." />
        </Form.Item>
        {/* test_point_id is contextual and passed to onFinish for create */}
      </Form>
    </Modal>
  );
};

export default TestCaseForm;
