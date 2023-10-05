import Image from "next/image";
import { Inter } from "next/font/google";
import DashboardLayouts from "@/components/layouts/DashboardLayouts";
import { Fragment, useEffect, useMemo, useState } from "react";
import SelectTables from "@/components/tables/layouts";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { SearchInput } from "@/components/forms/SearchInput";
import DropdownSelect from "@/components/dropdown/DropdownSelect";
import ReactDatePicker from "react-datepicker";
import {
  MdAdd,
  MdArrowBack,
  MdDelete,
  MdEdit,
  MdKeyOff,
  MdLockOpen,
  MdOutlineCalendarToday,
} from "react-icons/md";
import { GetServerSideProps } from "next";
import { deleteCookie, getCookies } from "cookies-next";
import { useAppDispatch, useAppSelector } from "@/redux/Hooks";
import { getAuthMe, selectAuth } from "@/redux/features/AuthenticationReducers";
import {
  deleteVehicleType,
  getVehicleTypes,
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
import ActiveLink from "@/components/layouts/link/ActiveLink";

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

export default function DurationSetting({ pageProps }: Props) {
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
          deleteCookie("accessToken");
          deleteCookie("refreshToken");
          deleteCookie("roles");
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

  return (
    <DashboardLayouts
      userDefault="/images/logo.png"
      logo="/images/logo.png"
      token={token}
      refreshToken={refreshToken}
      header={"User - Setting"}
      title={"Settings"}>
      <div className="w-full bg-white h-full overflow-auto relative">
        <nav className="bg-[#DFE8ED] z-99 sticky top-0 border-t-2 border-b-2 border-primary">
          <div className="mx-4 max-w-7xl px-2 sm:px-6 lg:px-8 py-4">
            <button
              type="button"
              className="inline-flex items-center gap-1 focus:outline-none px-2 text-primary"
              onClick={() => router.push({ pathname: "/" })}>
              <MdArrowBack className="w-4 h-4" />
              <span>Back to dashboard</span>
            </button>
          </div>
        </nav>

        <div className="w-full md:p-6 2xl:p-10">
          <h3 className="text-title-lg font-semibold">Settings</h3>
          {/* tabs */}
          <div className="w-full flex space-x-4 my-5">
            <ActiveLink
              pages={"user"}
              href={{ pathname: "/settings/user" }}
              activeClassName="text-primary border-b-2 border-primary"
              className="w-full flex lg:justify-center text-sm lg:text-base text-gray-6 hover:text-primary">
              <span>User List</span>
              <MdLockOpen className="w-4 h-4" />
            </ActiveLink>

            <ActiveLink
              pages={"duration"}
              href={{ pathname: "/settings/duration" }}
              activeClassName="text-primary border-b-2 border-primary"
              className="w-full lg:justify-center text-sm lg:text-base text-gray-6 hover:text-primary">
              Idle Status
            </ActiveLink>
          </div>

          <div className="w-full">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae,
            optio.
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