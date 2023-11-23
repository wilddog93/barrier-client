import Image from "next/image";
import { Inter } from "next/font/google";
import DashboardLayouts from "@/components/layouts/DashboardLayouts";
import {
  ChangeEvent,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SelectTables from "@/components/tables/layouts";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { SearchInput } from "@/components/forms/SearchInput";
import DropdownSelect from "@/components/dropdown/DropdownSelect";
import ReactDatePicker from "react-datepicker";
import {
  MdAdd,
  MdDelete,
  MdDocumentScanner,
  MdDownload,
  MdEdit,
  MdOutlineCalendarToday,
  MdUpload,
} from "react-icons/md";
import { GetServerSideProps } from "next";
import { deleteCookie, getCookies } from "cookies-next";
import { useAppDispatch, useAppSelector } from "@/redux/Hooks";
import {
  getAuthMe,
  selectAuth,
  webRefresh,
} from "@/redux/features/AuthenticationReducers";
import {
  deleteVehicleType,
  getVehicleTypes,
  importVehicleType,
  selectVehicleTypeManagement,
} from "@/redux/features/vehicleType/vehicleTypeReducers";
import { VehicleTypeProps } from "@/utils/propTypes";
import Button from "@/components/button/Button";
import { useRouter } from "next/router";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import Modal from "@/components/modal/Modal";
import { ModalHeader } from "@/components/modal/ModalComponent";
import FormVehicle from "@/components/forms/vehicle-type/FormVehicle";
import { FaCircleNotch } from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "@/components/layouts/header/Navbar";
import axios from "axios";
import { convertBytes, toBase64 } from "@/utils/useFunction";

const inter = Inter({ subsets: ["latin"] });

interface PageProps {
  page: string;
  token: any;
  refreshToken: any;
}

type Props = {
  pageProps: PageProps;
};

interface VehicleProps {
  rfid?: number | string | any;
  fullName?: string | any;
  vehiclesType?: string | any;
  vehiclesNumber?: string | any;
  arrival?: string | any;
  departure?: string | any;
}

interface Options {
  value: string | any;
  label: string | any;
}

const sortOpt: Options[] = [
  { value: "ASC", label: "A-Z" },
  { value: "DESC", label: "Z-A" },
];

const stylesSelectSort = {
  indicatorsContainer: (provided: any) => ({
    ...provided,
    flexDirection: "row-reverse",
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    display: "none",
  }),
  dropdownIndicator: (provided: any) => {
    return {
      ...provided,
      color: "#7B8C9E",
    };
  },
  clearIndicator: (provided: any) => {
    return {
      ...provided,
      color: "#7B8C9E",
    };
  },
  singleValue: (provided: any) => {
    return {
      ...provided,
      color: "#5F59F7",
    };
  },
  control: (provided: any, state: any) => {
    return {
      ...provided,
      background: "",
      padding: ".6rem",
      borderRadius: ".75rem",
      borderColor: state.isFocused ? "#5F59F7" : "#E2E8F0",
      color: "#5F59F7",
      "&:hover": {
        color: state.isFocused ? "#E2E8F0" : "#5F59F7",
        borderColor: state.isFocused ? "#E2E8F0" : "#5F59F7",
      },
      minHeight: 40,
      flexDirection: "row-reverse",
    };
  },
  menuList: (provided: any) => provided,
};

const stylesSelect = {
  indicatorSeparator: (provided: any) => ({
    ...provided,
    display: "none",
  }),
  dropdownIndicator: (provided: any) => {
    return {
      ...provided,
      color: "#7B8C9E",
    };
  },
  clearIndicator: (provided: any) => {
    return {
      ...provided,
      color: "#7B8C9E",
    };
  },
  singleValue: (provided: any) => {
    return {
      ...provided,
      color: "#5F59F7",
    };
  },
  control: (provided: any, state: any) => {
    // console.log(provided, "control")
    return {
      ...provided,
      background: "",
      padding: ".6rem",
      borderRadius: ".75rem",
      borderColor: state.isFocused ? "#5F59F7" : "#E2E8F0",
      color: "#5F59F7",
      "&:hover": {
        color: state.isFocused ? "#E2E8F0" : "#5F59F7",
        borderColor: state.isFocused ? "#E2E8F0" : "#5F59F7",
      },
      minHeight: 40,
      // flexDirection: "row-reverse"
    };
  },
  menuList: (provided: any) => provided,
};

const exData: VehicleProps[] | any[] = [
  {
    rfid: "1234DSA",
    fullName: "Jumakri Ridho Fauzi",
    vehiclesNumber: "B 1234 CWA",
    vehiclesType: "sedan",
    arrival: new Date(),
    departure: new Date(),
  },
  {
    rfid: "1234DSA",
    fullName: "Jumakri Ridho Fauzi",
    vehiclesNumber: "B 1234 CWA",
    vehiclesType: "sedan",
    arrival: new Date(),
    departure: new Date(),
  },
  {
    rfid: "1234DSA",
    fullName: "Jumakri Ridho Fauzi",
    vehiclesNumber: "B 1234 CWA",
    vehiclesType: "sedan",
    arrival: new Date(),
    departure: new Date(),
  },
  {
    rfid: "1234DSA",
    fullName: "Jumakri Ridho Fauzi",
    vehiclesNumber: "B 1234 CWA",
    vehiclesType: "sedan",
    arrival: new Date(),
    departure: new Date(),
  },
];

export default function VehicleType({ pageProps }: Props) {
  const router = useRouter();
  const { query, pathname } = router;
  const { token, refreshToken } = pageProps;

  const dispatch = useAppDispatch();
  const { data, error } = useAppSelector(selectAuth);

  // data vehicle-type
  const { vehicleTypes, pending } = useAppSelector(selectVehicleTypeManagement);

  useEffect(() => {
    if (!token) {
      return;
    }
    dispatch(
      getAuthMe({
        token,
        callback: () => {
          webRefresh({
            token: refreshToken,
            isSuccess: () => {
              router.replace({ pathname, query });
            },
            isError: () => {
              deleteCookie("role");
              deleteCookie("accessToken");
              deleteCookie("refreshToken");
            },
          });
        },
      })
    );
  }, [token]);

  const dateFormat = (value: any) => {
    let format: any = null;
    if (value) {
      format = moment(new Date(value)).format("DD/MM/YYYY");
    }
    return format;
  };

  const [pages, setPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);

  const [search, setSearch] = useState<string | any>(null);
  const [sort, setSort] = useState<Options | any>(null);
  const [types, setTypes] = useState<Options | any>(null);
  const [typesOpt, setTypesOpt] = useState<Options[] | any[]>([]);

  const [dataTable, setDataTable] = useState<any[] | any>([]);
  const [isSelected, setIsSelected] = useState<any[] | any>([]);
  const [loading, setLoading] = useState<false>(false);

  const now = new Date();
  const [start, setStart] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const [end, setEnd] = useState(
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
  );
  const [dateRange, setDateRange] = useState<Date[]>([start, end]);
  const [startDate, endDate] = dateRange;

  // modal
  const [isForm, setIsForm] = useState<any>(null);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  // export
  const [loadingExport, setLoadingExport] = useState<boolean>(false);
  const [isExport, setIsExport] = useState<boolean>(false);
  // import
  const fileRef = useRef<HTMLInputElement>(null);
  const [loadingImport, setLoadingImport] = useState<boolean>(false);
  const [isImport, setIsImport] = useState<boolean>(false);
  const [files, setFiles] = useState<any[]>([]);

  const isOpenCreate = () => {
    setIsCreate(true);
  };

  const isCloseCreate = () => {
    setIsForm(null);
    setIsCreate(false);
  };

  const isOpenUpdate = (value: any) => {
    setIsForm(value);
    setIsUpdate(true);
  };

  const isCloseUpdate = () => {
    setIsForm(null);
    setIsUpdate(false);
  };

  const isOpenDelete = (value: any) => {
    setIsForm(value);
    setIsDelete(true);
  };

  const isCloseDelete = () => {
    setIsForm(null);
    setIsDelete(false);
  };

  const isOpenExport = () => {
    setIsExport(true);
  };

  const isCloseExport = () => {
    setIsExport(false);
  };

  const isOpenImport = () => {
    setIsImport(true);
  };

  const isCloseImport = () => {
    if (fileRef.current) {
      fileRef.current.value = "";
      setFiles([]);
    }
    setIsImport(false);
  };

  // data-table
  useEffect(() => {
    if (query?.page) setPages(Number(query?.page) || 1);
    if (query?.limit) setLimit(Number(query?.limit) || 10);
    if (query?.search) setSearch((query?.search as any) || "");
    if (query?.sort) {
      if (query?.sort == "ASC") {
        setSort({ value: query?.sort, label: "A-Z" });
      } else {
        setSort({ value: query?.sort, label: "Z-A" });
      }
    }
  }, [query?.page, query?.limit, query?.search, query?.sort]);

  useEffect(() => {
    let qr: any = {
      page: pages,
      limit: limit,
    };

    if (search) qr = { ...qr, search: search };
    if (sort) qr = { ...qr, sort: sort?.value };

    router.replace({ pathname, query: qr });
  }, [pages, limit, search, sort]);

  const filters = useMemo(() => {
    const qb = RequestQueryBuilder.create();

    const search = {
      $and: [
        {
          $or: [
            { vehicleTypeCode: { $contL: query?.search } },
            { vehicleTypeName: { $contL: query?.search } },
          ],
        },
      ],
    };

    if (query?.page) qb.setPage(Number(query?.page) || 1);
    if (query?.limit) qb.setLimit(Number(query?.limit) || 10);

    qb.search(search);
    if (!query?.sort) {
      qb.sortBy({
        field: `updatedAt`,
        order: "DESC",
      });
    } else {
      qb.sortBy({
        field: `vehicleTypeName`,
        order: !sort?.value ? "ASC" : sort.value,
      });
    }
    qb.query();
    return qb;
  }, [query?.page, query?.limit, query?.search, query?.sort]);

  useEffect(() => {
    if (token) {
      dispatch(getVehicleTypes({ token, params: filters?.queryObject }));
    }
  }, [token, filters]);

  console.log("data-table :", vehicleTypes?.data);

  useEffect(() => {
    const newArr: VehicleTypeProps[] | any[] = [];
    let newPageCount: number | any = 0;
    let newTotal: number | any = 0;
    const { data, pageCount, total } = vehicleTypes;
    if (data && data?.length > 0) {
      data?.map((item: any) => {
        newArr.push(item);
      });
      newPageCount = pageCount;
      newTotal = total;
    }
    setDataTable(newArr);
    setPageCount(newPageCount);
    setTotal(newTotal);
  }, [vehicleTypes]);

  // column-table
  const columns = useMemo<ColumnDef<VehicleTypeProps, any>[]>(
    () => [
      {
        accessorKey: "vehicleTypeCode",
        header: (info) => <div className="uppercase">Vehicle Code</div>,
        cell: ({ getValue, row }) => {
          return <div>{getValue()}</div>;
        },
        footer: (props) => props.column.id,
        enableColumnFilter: false,
      },
      {
        accessorKey: "vehicleTypeName",
        cell: ({ row, getValue }) => {
          return <div>{getValue()}</div>;
        },
        header: (props) => (
          <div className="w-full text-left uppercase">Vehicle Type</div>
        ),
        footer: (props) => props.column.id,
        enableColumnFilter: false,
      },
      {
        accessorKey: "id",
        cell: ({ row, getValue }) => {
          return (
            <div className="w-full flex items-center justify-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 p-2 rounded-md border border-gray-5 hover:bg-gray active:scale-90"
                onClick={() => isOpenUpdate(row?.original)}>
                <span>
                  <MdEdit className="w-4 h-4" />
                </span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1 p-2 rounded-md border text-white border-danger bg-danger hover:opacity-70 active:scale-90"
                onClick={() => isOpenDelete(row?.original)}>
                <span>
                  <MdDelete className="w-4 h-4" />
                </span>
              </button>
            </div>
          );
        },
        header: (props) => (
          <div className="w-full text-center uppercase">Actions</div>
        ),
        footer: (props) => props.column.id,
        enableColumnFilter: false,
      },
    ],
    []
  );

  const onDeleteVehicle = (value: any) => {
    console.log(value, "delete");
    if (value?.id) {
      dispatch(
        deleteVehicleType({
          token,
          id: value?.id,
          isSuccess: () => {
            dispatch(getVehicleTypes({ token, params: filters.queryObject }));
            toast.dark("Delete vehicle type is successfull");
            isCloseDelete();
          },
        })
      );
    }
  };

  // export
  const onExportData = async (params: any) => {
    let date = moment(new Date()).format("lll");
    setLoadingExport(true);
    try {
      axios({
        url: `vehicleType/export`,
        method: "GET",
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.token}`,
        },
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Vehicle Type -${date}.xlsx`);
        document.body.appendChild(link);
        link.click();
        toast.dark("Export file's successfully");
        setLoadingExport(false);
        isCloseExport();
      });
    } catch (error: any) {
      const { data, status } = error.response;
      let newError: any = { message: data.message[0] };
      toast.dark(newError.message);
      setLoadingExport(false);
    }
  };

  // import
  const onSelectMultiImage = (e: ChangeEvent<HTMLInputElement>) => {
    const filePathsPromises: any[] = [];
    const fileObj = e.target.files;
    const preview = async () => {
      if (fileObj) {
        const totalFiles = e?.target?.files?.length;
        if (totalFiles) {
          for (let i = 0; i < totalFiles; i++) {
            const img = fileObj[i];
            // console.log(img, 'image obj')
            filePathsPromises.push(toBase64(img));
            const filePaths = await Promise.all(filePathsPromises);
            const mappedFiles = filePaths.map((base64File) => ({
              documentNumber: "",
              documentName: base64File?.name,
              documentSize: base64File?.size,
              documentSource: base64File?.images,
            }));
            setFiles(mappedFiles);
          }
        }
      }
    };
    if (!fileObj) {
      return null;
    } else {
      preview();
    }
  };

  const onDeleteFiles = (id: any) => {
    if (fileRef.current) {
      fileRef.current.value = "";
      setFiles(files.splice(id, 0));
    }
  };

  const onImportData = async (value: any) => {
    if (!value) {
      return;
    }
    let newObj: any = {
      excelFile: value?.document?.length > 0 ? value?.document[0] : "",
    };
    console.log(newObj, "import");
    dispatch(
      importVehicleType({
        token,
        data: newObj,
        isSuccess: () => {
          toast.dark("Document has been imported");
          dispatch(getVehicleTypes({ token, params: filters?.queryObject }));
          isCloseImport();
        },
      })
    );
  };

  return (
    <DashboardLayouts
      userDefault="/images/logo.png"
      logo="/images/logo.png"
      token={token}
      refreshToken={refreshToken}
      header={"Vehicle Type"}
      title={"type"}>
      <div className="w-full bg-white h-full overflow-auto relative">
        <Navbar />
        <div className="w-full md:p-6 2xl:p-10">
          <div className="w-full grid grid-cols-1 lg:grid-cols-7 gap-2.5 p-4">
            <div className="w-full lg:col-span-3">
              <SearchInput
                className="w-full text-sm rounded-xl"
                classNamePrefix=""
                filter={search}
                setFilter={setSearch}
                placeholder="Search..."
              />
            </div>
            <div className="w-full flex flex-col lg:flex-row items-center gap-2">
              <DropdownSelect
                customStyles={stylesSelectSort}
                value={sort}
                onChange={setSort}
                error=""
                className="text-sm font-normal text-gray-5 w-full lg:w-2/10"
                classNamePrefix=""
                formatOptionLabel=""
                instanceId="1"
                isDisabled={false}
                isMulti={false}
                placeholder="Sorts..."
                options={sortOpt}
                icon="MdSort"
                isClearable
              />
            </div>

            <Button
              type="button"
              variant="primary"
              className="rounded-lg hover:opacity-70 active:scale-90"
              onClick={isOpenCreate}>
              <span className="tex-sm">New Vehicle</span>
              <MdAdd className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="primary-outline"
              className="rounded-lg hover:opacity-70 active:scale-90 items-center"
              onClick={isOpenExport}>
              <span className="tex-sm">Export</span>
              <MdDownload className="w-5 h-5" />
            </Button>

            <Button
              type="button"
              variant="primary"
              className="rounded-lg hover:opacity-70 active:scale-90"
              onClick={isOpenImport}>
              <span className="tex-sm">Import</span>
              <MdUpload className="w-4 h-4" />
            </Button>
            {/* <div className="w-full flex flex-col lg:flex-row items-center gap-2">
          </div> */}
          </div>

          <div className="w-full">
            <SelectTables
              loading={loading}
              setLoading={setLoading}
              pages={pages}
              setPages={setPages}
              limit={limit}
              setLimit={setLimit}
              pageCount={pageCount}
              columns={columns}
              dataTable={dataTable}
              total={total}
              setIsSelected={setIsSelected}
              classTable=""
            />
          </div>
        </div>
      </div>

      {/* create vehicle type */}
      <Modal isOpen={isCreate} onClose={isCloseCreate} size="small">
        <FormVehicle
          token={token}
          items={isForm}
          isClose={isCloseCreate}
          refreshData={() =>
            dispatch(getVehicleTypes({ token, params: filters.queryObject }))
          }
        />
      </Modal>

      {/* create vehicle type */}
      <Modal isOpen={isUpdate} onClose={isCloseUpdate} size="small">
        <FormVehicle
          token={token}
          items={isForm}
          isClose={isCloseUpdate}
          refreshData={() =>
            dispatch(getVehicleTypes({ token, params: filters.queryObject }))
          }
          isUpdate
        />
      </Modal>

      {/* delete vehicle */}
      <Modal size="small" onClose={isCloseDelete} isOpen={isDelete}>
        <Fragment>
          <ModalHeader
            className="p-4 border-b-2 border-gray mb-3"
            isClose={true}
            onClick={isCloseDelete}>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">Delete Vehicle Type</h3>
              <p className="text-gray-5">{`Are you sure to delete ${
                isForm?.vehicleTypeName || ""
              } ?`}</p>
            </div>
          </ModalHeader>
          <div className="w-full flex items-center px-4 justify-end gap-2 mb-3">
            <Button
              type="button"
              variant="secondary-outline"
              className="rounded-lg border-2 border-gray-2 shadow-2 active:scale-90"
              onClick={isCloseDelete}>
              <span className="text-xs font-semibold">Discard</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              className="rounded-lg border-2 border-primary active:scale-90"
              onClick={() => onDeleteVehicle(isForm)}
              disabled={pending}>
              {pending ? (
                <Fragment>
                  <span className="text-xs">Deleting...</span>
                  <FaCircleNotch className="w-4 h-4 animate-spin-1.5" />
                </Fragment>
              ) : (
                <span className="text-xs">Yes, Delete it!</span>
              )}
            </Button>
          </div>
        </Fragment>
      </Modal>

      {/* export */}
      <Modal size="small" onClose={isCloseExport} isOpen={isExport}>
        <Fragment>
          <ModalHeader
            className="p-4 border-b-2 border-gray mb-3"
            isClose={true}
            onClick={isCloseExport}>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">Export Vehicle Type.</h3>
              <p className="text-gray-5">
                Do you want to export Vehicle Type ?
              </p>
            </div>
          </ModalHeader>
          <div className="w-full flex items-center px-4 justify-end gap-2 mb-3">
            <Button
              type="button"
              variant="secondary-outline"
              className="rounded-lg border-2 border-gray-2 shadow-2 active:scale-90"
              onClick={isCloseExport}>
              <span className="text-xs font-semibold">Discard</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              className="rounded-lg border-2 border-primary active:scale-90"
              onClick={() => onExportData({ token })}
              disabled={loadingExport}>
              {loadingExport ? (
                <Fragment>
                  <span className="text-xs">Processing...</span>
                  <FaCircleNotch className="w-4 h-4 animate-spin-1.5" />
                </Fragment>
              ) : (
                <span className="text-xs">Yes, Export it!</span>
              )}
            </Button>
          </div>
        </Fragment>
      </Modal>

      {/* import */}
      <Modal size="small" onClose={isCloseImport} isOpen={isImport}>
        <Fragment>
          <ModalHeader
            className="p-4 border-b-2 border-gray mb-3"
            isClose={true}
            onClick={isCloseImport}>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">Import Vehicle Type.</h3>
              <p className="text-gray-5">
                Do you want to import Vehicle Type ?
              </p>
            </div>
          </ModalHeader>

          <div className="w-full flex flex-col px-4 gap-2 mb-3">
            <div className="w-full flex gap-2">
              <div className="w-full flex flex-col gap-2">
                <div className="font-semibold">Document</div>
                {files && files?.length > 0
                  ? files?.map((file, id) => {
                      return (
                        <div key={id} className="w-full grid grid-cols-6 gap-2">
                          <div className="w-full flex max-w-[50px] h-[50px] min-h-[50px] border border-gray shadow-card rounded-lg justify-center items-center">
                            <MdDocumentScanner className="w-6 h-6" />
                          </div>
                          <div className="w-full col-span-4 text-sm">
                            <p>{file?.documentName}</p>
                            <p>
                              {file?.documentSize
                                ? convertBytes({ bytes: file?.documentSize })
                                : "-"}
                            </p>
                          </div>

                          <div className="w-full max-w-max flex justify-center items-center">
                            <Button
                              type="button"
                              variant="danger"
                              className={`rounded-lg text-sm py-1 px-2 shadow-card hover:opacity-90 active:scale-95 ml-auto`}
                              onClick={() => onDeleteFiles(id)}>
                              <MdDelete className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  : null}
              </div>
            </div>
            <input
              type="file"
              id="document"
              placeholder="Upload Document"
              autoFocus
              className={`w-full focus:outline-none max-w-max text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-primary file:text-sm file:font-semibold file:bg-violet-50 file:text-primary-700 hover:file:bg-violet-100 ${
                files?.length > 0 ? "hidden" : ""
              }`}
              onChange={onSelectMultiImage}
              ref={fileRef}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
          </div>

          <div className="w-full flex items-center p-4 justify-end gap-2 border-t-2 border-gray">
            <Button
              type="button"
              variant="secondary-outline"
              className="rounded-lg border-2 border-gray-2 shadow-2 active:scale-90"
              onClick={isCloseImport}>
              <span className="text-xs font-semibold">Discard</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              className="rounded-lg border-2 border-primary active:scale-90"
              onClick={() => onImportData({ token, data })}
              disabled={loadingImport}>
              {loadingImport ? (
                <Fragment>
                  <span className="text-xs">Processing...</span>
                  <FaCircleNotch className="w-4 h-4 animate-spin-1.5" />
                </Fragment>
              ) : (
                <span className="text-xs">Yes, Import it!</span>
              )}
            </Button>
          </div>
        </Fragment>
      </Modal>
    </DashboardLayouts>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  // Parse cookies from the request headers
  const cookies = getCookies({ req, res });

  // Access cookies using the cookie name
  const token = cookies["accessToken"] || null;
  const refreshToken = cookies["refreshToken"] || null;

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
    };
  }

  return {
    props: { token, refreshToken },
  };
};
