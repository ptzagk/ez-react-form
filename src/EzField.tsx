import * as React from 'react';
import { connect, Field, FastField } from 'formik';
import { getChildrenParts, isOptionArray } from './Utils'

const getClasses = (use: string) => {
  const defaults = {
    group: '',
    label: 'ez-label',
    control: 'ez-field',
    invalidControl: 'ez-field-error',
    error: 'ez-error'
  };
  if (use === 'bootstrap') {
    defaults.group = 'form-group';
    defaults.control = 'form-control';
    defaults.invalidControl = 'is-invalid';
    defaults.error = 'invalid-feedback';
  }
  if (use === 'spectre') {
    defaults.group = 'form-group';
    defaults.label = 'form-label';
    defaults.control = 'form-input';
    defaults.invalidControl = 'is-error';
    defaults.error = 'form-input-hint';
  }
  return defaults;
};

function Checkbox(props: any) {
  return (
    <Field name={props.name}>
      {({ field, form } : { field: any, form: any }) => (
        <label>
          <input
            type="checkbox"
            {...props}
            checked={field.value && field.value.includes(props.value)}
            onChange={() => {
              let nextValue
              field.value = field.value || []
              if (field.value.includes(props.value)) {
                nextValue = field.value.filter(
                  (value: any) => value !== props.value
                );
                form.setFieldValue(props.name, nextValue);
              } else {
                nextValue = field.value.concat(props.value);
                form.setFieldValue(props.name, nextValue);
              }
              props.onChange && props.onChange(nextValue);
            }}
          />
          &nbsp;
          {props.label}
        </label>
      )}
    </Field>
  );
}

function Radio(props: any) {
  return (
    <Field name={props.name}>
      {({ field, form } : { field: any, form: any }) => {
        return (
          <label>
            <input
              type="radio"
              {...props}
              checked={field.value === props.value}
              onChange={() => {
                form.setFieldValue(props.name, props.value);
                props.onChange && props.onChange(props.value);
              }}
            />
            &nbsp;
            {props.label}
          </label>
        )
      }}
    </Field>
  );
}

function FileUpload(props: any) {
  return (
    <Field name={props.name}>
      {({ field, form } : { field: any, form: any }) => {
        return (
          <input id="file" name="file" type="file" onChange={(event) => {
            form.setFieldValue("file", event.currentTarget.files[0]);
            props.onChange && props.onChange(event.currentTarget.files[0]);
          }} className="form-control" />
        )
      }}
    </Field>
  )
}

const EzField = (props: any) => {
  if (!props.children) {
    throw 'EzField is being used incorrectly: missing props.children';
    return null;
  }
  const { label, placeholder, fieldName } = getChildrenParts(props)

  const errors = props.formik.errors;
  const hasErrors =
    props.formik.errors.hasOwnProperty(fieldName) &&
    (props.formik.touched.hasOwnProperty(fieldName) || props.formik.submitCount > 0);

  const classes = getClasses(props.formik.ezUse);
  const css = props.formik.ezCss || {}
  const labelCss = css.label || props.labelCss || ''
  const labelClass = labelCss ? `${classes.label} ${labelCss}` : classes.label

  const controlCss = css.control || props.controlCss || ''
  const controlClass = controlCss ? `${classes.control} ${controlCss}` : classes.control

  const errorCss = css.error || props.errorCss || ''
  const errorClass = errorCss ? `${classes.error} ${errorCss}` : classes.error

  let options = null
  if (isOptionArray(props.options)) {
    options = props.options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)
  }
  const Label = () => <label htmlFor={fieldName} className={labelClass}>
    {label}
  </label>

  const moreProps: any = {}
  if (props.textarea) {
    moreProps.component = 'textarea'
  }
  if (props.select) {
    moreProps.component = 'select'
  }
  if (props.number) {
    moreProps.type = 'number'
  }
  if (props.password) {
    moreProps.type = 'password'
  }
  if (props.date) {
    moreProps.type = 'date'
  }
  return (
    <div className={classes.group}>
      {props.file ? (
        <FileUpload label={label} name={fieldName} value={props.value} onChange={props.onChange} />
      ) : props.checkbox ? (
        <Checkbox label={label} name={fieldName} value={props.value} onChange={props.onChange} />
      ) : props.radio ? (
        <Radio label={label} name={fieldName} value={props.value} onChange={props.onChange} />
      ) : (props.radios && props.options) ? (
        <React.Fragment>
          <Label />
          <div className={`ez-field-full ${hasErrors ? classes.invalidControl : ''}`}>
            {props.options.map((opt: any) => (
              <Radio key={opt.value} label={opt.label} name={fieldName} value={opt.value} onChange={props.onChange} />
            ))}
          </div>
        </React.Fragment>
      ) : (props.checkboxes && props.options) ? (
        <React.Fragment>
          <Label />
          <div className={`ez-field-full ${hasErrors ? classes.invalidControl : ''}`}>
            {props.options.map((opt: any) => (
              <Checkbox key={opt.value} label={opt.label} name={fieldName} value={opt.value} onChange={props.onChange} />
            ))}
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Label />
          <FastField
            name={fieldName}
            placeholder={placeholder}
            onChange={(val: any) => { props.formik.handleChange(val); props.onChange && props.onChange(val); }}
            validate={props.validate}
            className={`${controlClass} ${hasErrors ? classes.invalidControl : ''}`}
            {...(typeof props.children !== 'string' ? props : {})}
            {...moreProps}
          >{options}</FastField>
        </React.Fragment>
      )}
      {hasErrors && <span className={errorClass}>{errors[fieldName]}</span>}
    </div>
  );
};
export default connect(EzField);
