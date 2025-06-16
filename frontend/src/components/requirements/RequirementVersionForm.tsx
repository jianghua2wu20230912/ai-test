import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Upload } from 'antd'; // Added Upload for file_path
import { UploadOutlined } from '@ant-design/icons';
import { RequirementVersion, RequirementVersionCreate, RequirementVersionUpdate } from '../../types/requirement';

interface RequirementVersionFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: RequirementVersionCreate | RequirementVersionUpdate) => void;
  initialValues?: RequirementVersion | null;
  loading?: boolean;
  requirementId?: number | null; // To associate with a requirement if creating
}

const RequirementVersionForm: React.FC<RequirementVersionFormProps> = ({
  visible,
  onCancel,
  onFinish,
  initialValues,
  loading = false,
  requirementId,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          version_string: initialValues.version_string,
          description: initialValues.description || '',
          file_path: initialValues.file_path || '', // Or handle Upload component state
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // For file_path, the value might need to be extracted from Upload component's state if it's complex.
      // For simplicity, assuming file_path is a string for now.
      if (!initialValues && requirementId) {
        onFinish({ ...values, requirement_id: requirementId });
      } else {
        onFinish(values as RequirementVersionUpdate);
      }
    } catch (errorInfo) {
      console.log('Form validation Failed:', errorInfo);
    }
  };

  // Dummy props for Upload component, replace with actual upload logic later
  const uploadProps = {
    name: 'file',
    action: '/api/v1/upload-placeholder', // Replace with actual upload endpoint
    beforeUpload: (file: File) => {
      // Example: client-side validation
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        message.error(`${file.name} is not a PDF file`);
      }
      // You can return false to stop upload, or a Promise to modify the file
      return isPDF || Upload.LIST_IGNORE;
    },
    onChange: (info: any) => { // AntD UploadChangeParam
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        // Assuming the server returns the file path or ID in response.data
        // form.setFieldsValue({ file_path: info.file.response?.filePath });
        form.setFieldsValue({ file_path: info.file.name }); // Placeholder: use filename
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    // defaultFileList: initialValues?.file_path ? [{ uid: '-1', name: initialValues.file_path.split('/').pop() || 'file', status: 'done', url: initialValues.file_path }] : [],
  };


  return (
    <Modal
      title={initialValues ? 'Edit Version' : 'Add New Version'}
      open={visible}
      onCancel={onCancel}
      confirmLoading={loading}
      footer={[
        <Button key="back" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {initialValues ? 'Save Changes' : 'Create'}
        </Button>,
      ]}
      destroyOnClose // Good for resetting form state within Modal, especially with Upload
    >
      <Form form={form} layout="vertical" name="requirement_version_form" initialValues={{ description: '', file_path: ''}}>
        <Form.Item
          name="version_string"
          label="Version String"
          rules={[{ required: true, message: 'Please input the version string (e.g., v1.0, Rev A)!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="file_path_upload" // Use a different name for Upload component if file_path is just a string in the form
          label="Associated File (Optional)"
          // valuePropName="fileList" // If using Upload's controlled mode
          // getValueFromEvent={normFile} // Helper to extract file list
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Click to Upload PDF</Button>
          </Upload>
        </Form.Item>
         <Form.Item
          name="file_path" // Hidden field to store the actual file_path string if needed separately from upload UI
          hidden
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Helper for Upload component if needed for controlled mode
// const normFile = (e: any) => {
//   if (Array.isArray(e)) {
//     return e;
//   }
//   return e?.fileList;
// };

export default RequirementVersionForm;

// Need to import message from antd for upload feedback
import { message } from 'antd';
