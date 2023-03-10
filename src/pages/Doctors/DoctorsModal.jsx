import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import formatValue from "../../components/formatValue";
import FromInput from "../../components/FromInput";
import FromSelect from "../../components/FromSelect";
import { onlyNumber } from "../../components/onlyNumber";
import SearchSelect from "../../components/SearchSelect";
import { selectDataFormate } from "../../components/selectDataFormate";
import { useGetDistrictsQuery } from "../../features/districtApi";
import {
  useAddDoctorMutation,
  useUpdateDoctorMutation,
} from "../../features/doctorApi";
import { useGetLocationssQuery } from "../../features/locationApi";
import { useGetUpozilasQuery } from "../../features/upozilaApi";
import DistrictModal from "../Districts/DistrictModal";
import LocationModal from "../Location/LocationModal";
import UpozilaModal from "../Upozilas/UpozilaModal";

export const options = [
  { value: "Kushtia Medical College", label: "Kushtia Medical College" },
  { value: "Jessore Medical College", label: "Jessore Medical College" },
  { value: "Dhaka Medical College", label: "Dhaka Medical College" },
];

export const locationList = [
  { value: "Hospital More", label: "Hospital More" },
  { value: "College More", label: "College More" },
  { value: "Jogoti", label: "Jogoti" },
];

const specialestData = [
  { name: "Medicin", id: "1" },
  { name: "Neurologiest", id: "2" },
  { name: "Nose Hair", id: "3" },
  { name: "Dentiest", id: "4" },
];

export const doctorTitles = [
  { name: "Professor", id: "1" },
  { name: "Associet Professor", id: "2" },
  { name: "Health Doctor", id: "3" },
  { name: "Department Head", id: "4" },
];

const autoCompleteFieldName = {
  collegeHospital: "",
  district: "",
  district_id: "",
  upozila: "",
  upozila_id: "",
  location: "",
};

export default function DoctorsModal({
  isOpen,
  setIsOpen,
  editItem,
  setEditItem,
  setToast,
}) {
  const [autoCompleteName, setAutCompleteName] = useState(
    autoCompleteFieldName
  );

  const [isOpenDistrict, setIsOpenDistrict] = useState(false);
  const [isOpenUpozila, setIsOpenUpozila] = useState(false);
  const [isOpenLocation, setIsOpenLocation] = useState(false);
  const [editDistrict, setEditDistrict] = useState({});
  const [editUpozila, setEditUpozila] = useState({});
  const [editLocation, setEditLocation] = useState({});

  const [addDoctor, { isLoading, isSuccess }] = useAddDoctorMutation();

  const { data: districts, isSuccess: isZillaSuccess } =
    useGetDistrictsQuery("");

  const [upozilaSearchUrl, setUpozilaSearchUrl] = useState({
    url: "",
    skip: true,
  });

  const { data: upozilas, isSuccess: isUpozilaSuccess } = useGetUpozilasQuery(
    upozilaSearchUrl.url,
    { refetchOnMountOrArgChange: true, skip: upozilaSearchUrl?.skip }
  );

  const [locationSearchUrl, setLocationSearchUrl] = useState({
    url: "",
    skip: true,
  });

  const { data: locations, isSuccess: isLocationSuccess } =
    useGetLocationssQuery(locationSearchUrl.url, {
      refetchOnMountOrArgChange: true,
      skip: locationSearchUrl?.skip,
    });

  const [
    updateDoctor,
    { isSuccess: isUpdateSuccess, isLoading: isUpdateLoading },
  ] = useUpdateDoctorMutation();

  let initial = {
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    specialest: "",
    title: "",
    collegeHospital: "",
    status: true,
    district: "",
    upozila: "",
    location: "",
  };

  const formik = useFormik({
    initialValues: initial,
    validate: (values) => {
      const errors = {};

      if (!values.first_name) {
        errors.first_name = "The first Name is Required";
      }
      if (!values.phone) {
        errors.phone = "The phone field is Required";
      }
      if (
        values.email &&
        !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
          values.email
        )
      ) {
        errors.email = "This email is not valid!";
      }
      if (!values.email) {
        errors.email = "The email field is Required";
      }
      if (!values.title) {
        errors.title = "The title field is Required";
      }
      if (!values.collegeHospital) {
        errors.collegeHospital = "The College/hosital field is Required";
      }
      if (!values.specialest) {
        errors.specialest = "The specialest field is Required";
      }
      if (!values.district) {
        errors.district = "The district field is Required";
      }
      return errors;
    },
    onSubmit: (values) => {
      const currentValues = { ...values };

      if (editItem?.id) {
        updateDoctor({ id: editItem?.id, data: currentValues });
      } else {
        addDoctor(currentValues);
      }
    },
  });

  useEffect(() => {
    if (editItem?.id) {
      formik.setValues({ ...editItem });
      setAutCompleteName({
        collegeHospital: editItem?.collegeHospital ?? "",
        district: editItem?.district ?? "",
        district_id: editItem?.district_id ?? "",
        upozila: editItem?.upozila ?? "",
        upozila_id: editItem?.upozila_id ?? "",
        location: editItem?.location ?? "",
      });
      if (editItem?.upozila_id) {
        setLocationSearchUrl({
          url: `?upozila_id=${editItem?.upozila_id}`,
          skip: false,
        });
      }
      if (editItem?.district_id) {
        setUpozilaSearchUrl({
          url: `?district_id=${editItem?.district_id}`,
          skip: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem]);

  const handleSearchChange = (e, type) => {
    if (e && type === "district") {
      setAutCompleteName({
        ...autoCompleteName,
        [type]: e.value,
        district_id: e.id,
      });
      formik.setValues({
        ...formik.values,
        [type]: e.value,
        district_id: e.id,
      });
      setUpozilaSearchUrl({ url: `?district_id=${e.id}`, skip: false });
    } else if (e && type === "upozila") {
      setAutCompleteName({
        ...autoCompleteName,
        [type]: e.value,
        upozila_id: e.id,
      });
      formik.setValues({ ...formik.values, [type]: e.value, upozila_id: e.id });
      setLocationSearchUrl({ url: `?upozila_id=${e.id}`, skip: false });
    } else if (e && (type === "location" || type === "collegeHospital")) {
      setAutCompleteName({
        ...autoCompleteName,
        [type]: e.value,
      });
      formik.setValues({ ...formik.values, [type]: e.value });
    } else if (e === null && type === "district") {
      setAutCompleteName({
        ...autoCompleteName,
        [type]: "",
        upozila: "",
        location: "",
      });
      formik.setValues({
        ...formik.values,
        [type]: "",
        district_id: "",
        upozila_id: "",
        upozila: "",
        location: "",
      });
      setUpozilaSearchUrl({ url: ``, skip: true });
      setLocationSearchUrl({ url: ``, skip: true });
    } else if (e === null && type === "upozila") {
      setAutCompleteName({
        ...autoCompleteName,
        [type]: "",
        location: "",
        upozila_id: "",
      });
      formik.setValues({
        ...formik.values,
        [type]: "",
        location: "",
      });
      setLocationSearchUrl({ url: ``, skip: true });
    } else {
      setAutCompleteName({
        ...autoCompleteName,
        [type]: "",
      });
      formik.setValues({
        ...formik.values,
        [type]: "",
      });
    }
  };

  const toggle = () => {
    setIsOpen(false);
    formik.resetForm();
    setEditItem({});
    setAutCompleteName(autoCompleteFieldName);
  };

  useEffect(() => {
    if (isSuccess) {
      setToast({ message: "Successfully Added" });
      toggle();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    if (isUpdateSuccess) {
      setToast({ message: "Successfully Updated", fetch: true });
      toggle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdateSuccess]);


  return (
    <form>
      <Modal isOpen={isOpen} size="xl" toggle={toggle}>
        <ModalHeader toggle={toggle}>
          {editItem?.id ? "Update" : "Add"} Doctor
        </ModalHeader>
        <ModalBody>
          <div className="row">
            <div className="col-md-6">
              <FromInput
                name="first_name"
                id="first_name"
                label="First Name"
                placeholder="First Name"
                isTouched={formik.touched.first_name}
                invalidFeedback={formik.errors.first_name}
                isValid={formik.isValid}
                value={formik.values?.first_name ?? ""}
                onChange={formik.handleChange}
              />
            </div>
            <div className="col-md-6">
              <FromInput
                name="last_name"
                id="last_name"
                label="Last Name"
                placeholder="Last Name"
                value={formik.values?.last_name ?? ""}
                onChange={formik.handleChange}
              />
            </div>
            <div className="col-md-6">
              <FromInput
                name="phone"
                id="phone"
                label="Phone"
                isTouched={formik.touched.phone}
                invalidFeedback={formik.errors.phone}
                isValid={formik.isValid}
                placeholder="Phone"
                value={onlyNumber(formik.values?.phone) ?? ""}
                onChange={formik.handleChange}
              />
            </div>
            <div className="col-md-6">
              <FromInput
                name="email"
                id="email"
                type="email"
                label="Email"
                isTouched={formik.touched.email}
                invalidFeedback={formik.errors.email}
                isValid={formik.isValid}
                placeholder="Email"
                value={formik.values?.email ?? ""}
                onChange={formik.handleChange}
              />
            </div>
            <div className="col-md-6">
              <FromSelect
                list={specialestData ?? []}
                name="specialest"
                id="specialest"
                label="Specialest"
                placeholder="Specialest"
                isTouched={formik.touched.specialest}
                invalidFeedback={formik.errors.specialest}
                isValid={formik.isValid}
                value={formik.values?.specialest ?? "Select Specialest"}
                onChange={formik.handleChange}
              />
            </div>
            <div className="col-md-6">
              <FromSelect
                list={doctorTitles ?? []}
                name="title"
                id="title"
                label="Title"
                isTouched={formik.touched.title}
                invalidFeedback={formik.errors.title}
                isValid={formik.isValid}
                placeholder="Title"
                value={formik.values?.title ?? "Select Title"}
                onChange={formik.handleChange}
              />
            </div>
            <div className="col-md-6">
              <SearchSelect
                list={options ?? []}
                value={formatValue(
                  autoCompleteName?.collegeHospital,
                  "Select College/Hospital"
                )}
                isTouched={formik.touched.collegeHospital}
                invalidFeedback={formik.errors.collegeHospital}
                isValid={formik.isValid}
                label="College/Hospital"
                name="collegeHospital"
                onChange={(e) => handleSearchChange(e, "collegeHospital")}
              />
            </div>
            <div className="col-md-6">
              {/* <div className="row px-4">
                <div className="col-md-11"> */}
              <SearchSelect
                list={selectDataFormate(
                  isZillaSuccess,
                  districts?.data,
                  "district_name"
                )}
                isTouched={formik.touched.district}
                invalidFeedback={formik.errors.district}
                isValid={formik.isValid}
                value={formatValue(
                  autoCompleteName?.district,
                  "Select District"
                )}
                label="District"
                name="district"
                onChange={(e) => handleSearchChange(e, "district")}
              >
                <Button color="primary" onClick={() => setIsOpenDistrict(true)}>
                  <i className="bi bi-plus-circle"></i>
                </Button>
              </SearchSelect>
            </div>
            <div className="col-md-6">
              <SearchSelect
                list={selectDataFormate(
                  isUpozilaSuccess,
                  upozilas?.data,
                  "upozila_name"
                )}
                value={formatValue(autoCompleteName?.upozila, "Select Upozila")}
                label="Upozila"
                name="upozila"
                onChange={(e) => handleSearchChange(e, "upozila")}
              >
                <Button
                  color="primary"
                  onClick={() => {
                    setIsOpenUpozila(true);
                    setEditUpozila({
                      district_id: autoCompleteName?.district_id,
                      district_name: autoCompleteName?.district,
                      status: true,
                    });
                  }}
                >
                  <i className="bi bi-plus-circle"></i>
                </Button>
              </SearchSelect>
            </div>
            <div className="col-md-6">
              <SearchSelect
                list={selectDataFormate(
                  isLocationSuccess,
                  locations?.data,
                  "location_name"
                )}
                value={formatValue(
                  autoCompleteName?.location,
                  "Select Location"
                )}
                label="Location"
                name="location"
                onChange={(e) => handleSearchChange(e, "location")}
              >
                <Button
                  color="primary"
                  onClick={() => {
                    setIsOpenLocation(true);
                    setEditLocation({
                      upozila_id: autoCompleteName?.upozila_id,
                      upozila_name: autoCompleteName?.upozila,
                      status: true,
                    });
                  }}
                >
                  <i className="bi bi-plus-circle"></i>
                </Button>
              </SearchSelect>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center justify-content-between">
                <label>Status</label>
                <div className="d-flex">
                  <div>
                    <input
                      type="radio"
                      id="active"
                      className="me-1"
                      value={true}
                      onChange={() =>
                        formik.setValues({
                          ...formik.values,
                          status: true,
                        })
                      }
                      checked={formik?.values?.status}
                    />
                    <label for="active">Active</label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="inactive"
                      value={false}
                      onChange={() =>
                        formik.setValues({
                          ...formik.values,
                          status: false,
                        })
                      }
                      checked={!formik?.values?.status}
                      className="ms-3 me-1"
                    />
                    <label for="inactive">Inactive</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={formik.handleSubmit}
            disabled={isLoading || isUpdateLoading}
          >
            {(isLoading || isUpdateLoading) && <Spinner size="sm"></Spinner>}{" "}
            <span className="d-flex gap-2">
              <i
                className={`${
                  editItem?.id ? "bi bi-pencil" : "bi bi-plus-circle"
                }`}
              ></i>
              {editItem?.id ? "Update" : "Add"}
            </span>{" "}
          </Button>
        </ModalFooter>
        <DistrictModal
          editItem={editDistrict}
          setEditItem={setEditDistrict}
          setIsOpen={setIsOpenDistrict}
          isOpen={isOpenDistrict}
          setToast={setToast}
        />
        <UpozilaModal
          editItem={editUpozila}
          setEditItem={setEditUpozila}
          setIsOpen={setIsOpenUpozila}
          isOpen={isOpenUpozila}
          setToast={setToast}
        />
        <LocationModal
          editItem={editLocation}
          setEditItem={setEditLocation}
          setIsOpen={setIsOpenLocation}
          isOpen={isOpenLocation}
          setToast={setToast}
        />
      </Modal>
    </form>
  );
}
