import React, { useState, useRef, useEffect } from 'react';
import Context from "./context";
import { openDB } from "idb";
import axios from 'axios';
import AlertAudio from "../audio/alert-fooddo.mpeg";
import FBConfig from "../FBConfig";
import { v4 as uuidv4 } from "uuid";
import UfFb from "../firebase/unsynced_files_firebase";
import { useReactToPrint } from "react-to-print";

const State = (props) => {

    const [finalState, setFinalState] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [menusCollection, setMenusCollection] = useState([]);
    const [sectionsState, setSectionsState] = useState([]);
    const [orderProps, setOrderProps] = useState({ order_type: null, order_uuid: null, seat_uuid: null, target_order: null })

    const [bulkUploadedData, setBulkUploadedData] = useState({});
    const [itemsState, setItemsState] = useState('')
    const [seatsState, setSeatsState] = useState('');
    const [forceRenderOrdersPage, setForceRenderOrdersPage] = useState(null);
    const [forceRenderPage1, setForceRenderPage1] = useState(null);
    const [forceRenderPage, setForceRenderPage] = useState(null);
    const [menuCategories, setMenuCategories] = useState(null);
    const [selected_category, setSelected_category] = useState('All');
    const [editedOrderData, setEditedOrderData] = useState(null);
    const [inventoryPageContent, setInventoryPageContent] = useState(null);
    const [unAuthPopup, setUnAuthPopup] = useState(false);
    const [newLoginData, setNewLoginData] = useState({});
    const [flushData, setFlushData] = useState(false);
    const [videoPopUp, setVideoPopUp] = useState(false);
    const [unSyncCount, setUnSyncCount] = useState(false);
    const [runningOrders, setRunningOrders] = useState([]);
    const [schemes, setSchemes] = useState(null);

    const payment_popup_save_btns_ref = useRef();
    const itemChargesHandlerRef = useRef(null);
    const itemChargesValueRef = useRef([]);
    const currentOrderRef = useRef(null);
    const cursorItemRef = useRef(null);

    const [orderRequestAlarm, triggerOrderRequestAlarm] = useState(null);

    // Invoices Dependencies
    const kotPrintElemRef = useRef()
    const [kotPrintDependencies, setKotPrintDependencies] = useState({})
    const invoicePrintElemRef = useRef()
    const [invoicePrintDependencies, setInvoicePrintDependencies] = useState({})

    useEffect(() => {
        const getData = async () => {
            if (+localStorage.getItem("user_type") === 3) return;
            if (window.location.pathname.includes('/login') || !sessionStorage.getItem('token')) return;
            const db = await openDB("FoodDo", +localStorage.getItem('IDBVersion') || 1);
            let store = db.transaction("scheme", "readonly").objectStore("scheme");
            const schemes = await store.getAll();
            setSchemes(schemes)
        }
        getData()
    }, [forceRenderPage1, forceRenderOrdersPage, forceRenderPage])

    const showWarning = ({ message, classname, time = 2000, remove }) => {

        clearInterval(sessionStorage.getItem("notification-warning-timeout"));

        if (remove) {
            document.querySelector(".notification-container").className = 'notification-container';
            return
        }
        document.querySelector(".notification-message").innerText = message;
        document.querySelector(".notification-container").classList.add(classname);

        const timeoutId = setTimeout(() => {
            document.querySelector(".notification-container").className = 'notification-container';
        }, time);

        sessionStorage.setItem("notification-warning-timeout", timeoutId);
    }

    const getAndUpdateUnsyncCount = async () => {
        const db = await openDB("FoodDo", +localStorage.getItem("IDBVersion") || 1);
        const tx = await db.transaction("unsynced_files", "readonly").objectStore("unsynced_files");
        const docs = await tx.getAllKeys()
        setUnSyncCount(docs.length);
    }

    const updateUnSync = async () => {

        await getAndUpdateUnsyncCount()
        if (!window.navigator.onLine) return console.warn('User is offline, syncing timer not set')
        else if (!sessionStorage.getItem("FB_SYNCING_SETUP") && !JSON.parse(sessionStorage.getItem("syncing_timers"))) {
            sessionStorage.setItem("FB_SYNCING_SETUP", true)
            UfFb.ReadValueFromFirebase(
                localStorage.getItem("outlet_uuid"),
                setForceRenderOrdersPage,
                setForceRenderPage1,
                generateMenues,
                getAndUpdateUnsyncCount
            );
        }
        // setUpdatedUnSyncCount(!updatedUnSyncCount)
    };

    const getBulkData = async (TempBulkData, bulkUploadedDataSet) => {
        if (bulkUploadedDataSet) setBulkUploadedData(bulkUploadedDataSet);
        console.log("TempBulkData", TempBulkData, bulkUploadedData, bulkUploadedDataSet)
        let files = TempBulkData?.file?.slice(0, 10)
        axios
            ({
                url: "https://api.myfooddo.com/item/postBulkItem", method: "POST",
                data: { files, menu: TempBulkData?.menu, outlet_uuid: TempBulkData?.outlet_uuid },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }).then(response => {
                console.log("TempBulkData", response)
                let data = response.data
                if (data.success && data?.count?.length) {
                    let bulk = bulkUploadedDataSet
                    let count = data?.count?.length
                    let newItems = bulk.newItems + data.newItems
                    let newCategoryCount = bulk.newCategoryCount + data.newCategoryCount
                    let updateCount = bulk.updateCount + data.updateCount
                    bulk = {
                        ...bulk,
                        count: bulk.count - count,

                        newItems,
                        newCategoryCount,
                        updateCount,
                    }
                    setBulkUploadedData(bulk)
                    console.log("TempBulkData", bulk.count, bulk.total, count)
                    if (bulk.count > 0) {

                        getBulkData({ ...TempBulkData, file: TempBulkData.file.filter(a => !(data.count.filter(b => b.key === a.key)?.length)) }, bulk)
                    }
                    else {

                        setIsBulkUploadOpen(true)


                    }
                } else getBulkData(TempBulkData, bulkUploadedDataSet);
            }
            ).catch(err => {
                console.log(err);
                getBulkData(TempBulkData, bulkUploadedDataSet)
            }
            )


    }

    function cartHandler({ item_uuid, addons = [], multi = [], parcel = "N", action, instruction, cart_item_id, item_qty }) {

        if (addons?.[0]) addons = addons?.map(({ name, ...addon }) => addon)
        const decimal_length = +sessionStorage.getItem('decimal_length')
        const orderItems = itemChargesValueRef.current;
        const item = selectedMenu?.category_and_items
            ?.filter(c => c.menu_items?.find(i => i.item_uuid === item_uuid))?.[0]
            ?.menu_items?.find(i => i.item_uuid === item_uuid)

        let cartItem = cart_item_id
            ? orderItems?.find(i => i.cart_item_id === cart_item_id)
            : orderItems?.find(i => {
                console.log("parcel", i.parcel === parcel, i.parcel, parcel);
                console.log("addons", JSON.stringify(i.addon_details) === JSON.stringify(addons), JSON.stringify(i.addon_details), JSON.stringify(addons));
                console.log("multi", JSON.stringify(i.multi_details) === JSON.stringify(multi), JSON.stringify(i.multi_details), JSON.stringify(multi));

                if (i.item_uuid === item_uuid
                    && JSON.stringify(i.addon_details) === JSON.stringify(addons)
                    && JSON.stringify(i.multi_details) === JSON.stringify(multi)
                    && i.parcel === parcel)
                    return i
                else return ''
            });

        function setOrderItems(data) {
            console.log(data);
            itemChargesValueRef.current = data;
            itemChargesHandlerRef.current.click()
        }

        if (cartItem) {
            console.log(`EXISTING ITEM FOUND: `, cartItem)
            let itemsArray = orderItems;

            if (action === 'instruction') {
                if (!instruction || instruction === 'remove-cooking-instruction') delete cartItem.order_item_instruction
                else cartItem.order_item_instruction = instruction;
            }
            else if (action === 'reduction' && (+cartItem.order_item_qty <= 1)) {
                return setOrderItems(itemsArray?.filter(i => i.cart_item_id !== cartItem.cart_item_id));
            }
            else if (action === 'increment' || action === 'reduction' || action === 'quantity') {

                if (action === 'quantity') {
                    cartItem.order_item_qty = item_qty;
                } else {
                    const qty = action === 'increment' ? +1 : -1
                    cartItem.order_item_qty += qty;
                }
                cartItem.order_item_taxable_value = cartItem.unit_price * cartItem.order_item_qty
                cartItem.order_item_amount_inclusive_taxes = (cartItem.unit_price + cartItem.order_item_unit_gst + cartItem.order_item_unit_vat) * cartItem.order_item_qty

                if (cartItem.parcel === 'Y') {
                    const quantity = +cartItem.order_item_parcel_type === 2 ? cartItem.order_item_qty : 1;
                    const parcelCharges = +cartItem.order_item_unit_parcel_charge * quantity;
                    cartItem.order_item_amount_inclusive_taxes += parcelCharges;
                }
            }
            else if (action === 'parcel') {

                const parcel = cartItem.parcel === 'Y' ? 'N' : 'Y'
                let duplicateItem = itemsArray.find(i => {
                    if (i.item_uuid === cartItem.item_uuid
                        && JSON.stringify(i.addon_details) === JSON.stringify(cartItem.addon_details)
                        && JSON.stringify(i.multi_details) === JSON.stringify(cartItem.multi_details)
                        && i.parcel === parcel)
                        return i
                    else return ''
                });

                if (duplicateItem) {
                    itemsArray = itemsArray.filter(i => i.cart_item_id !== duplicateItem.cart_item_id)
                    cartItem.parcel = parcel;
                    cartItem.order_item_qty = cartItem.order_item_qty + duplicateItem.order_item_qty;

                    const quantity = +cartItem.order_item_parcel_type === 2 ? cartItem.order_item_qty : 1;
                    const parcelCharges = +duplicateItem.order_item_unit_parcel_charge * quantity;
                    cartItem.order_item_amount_inclusive_taxes += parcelCharges;
                }
                else {
                    cartItem.parcel = parcel;
                    let quantity = +item.item_parcel_type === 2 ? +cartItem.order_item_qty : 1;
                    let parcelTax = 1 + (+(item.menu_item_parcel_tax || 0) / 100);
                    let order_item_unit_parcel_charge = +(+(item.menu_item_parcel_charge || 0) * parcelTax).toFixed(decimal_length);

                    if (parcel === 'N') {
                        delete cartItem.order_item_parcel_type
                        delete cartItem.order_item_unit_parcel_charge
                        cartItem.order_item_amount_inclusive_taxes -= (order_item_unit_parcel_charge * quantity);
                    } else {
                        cartItem.order_item_parcel_type = +item.item_parcel_type;
                        cartItem.order_item_unit_parcel_charge = order_item_unit_parcel_charge;
                        cartItem.order_item_amount_inclusive_taxes += (order_item_unit_parcel_charge * quantity);
                    }
                }
            }

            setOrderItems(itemsArray?.map(i => i.cart_item_id === cartItem.cart_item_id ? cartItem : i));
        }
        else {
            console.log('NO MATCHED ITEM FOUND')
            const createdItem = addItemToCart({ item, addons, multi, instruction })
            setOrderItems([...orderItems, createdItem]);
        }
    };

    function addItemToCart({ item, addons, multi, instruction, qty }) {

        let addons_price = addons?.reduce((sum, addon) => sum += +addon.price, 0) || 0;
        let multi_price = multi?.reduce((sum, multi) => sum += +multi.price, 0) || 0;

        let base_price = +item.menu_item_price;
        let discount = (base_price * +item.menu_item_discount.toString().replace("-", "")) / 100;

        let price = base_price - discount + addons_price + multi_price
        let gst = (+price * +item.item_gst) / 100;
        let vat = (+price * +item.item_vat) / 100;

        let generatedItem = {
            item_uuid: item.item_uuid,
            parcel: "N",
            order_item_qty: +qty || 1,
            order_item_unit_price: +(base_price.toFixed(2)),
            order_item_unit_discount: +(discount.toFixed(2)),
            order_item_unit_gst: +(gst.toFixed(2)),
            order_item_unit_vat: +(vat.toFixed(2)),
            order_item_costing: +(item?.item_costing),
            order_item_taxable_value: +(price.toFixed(2)),
            order_item_amount_inclusive_taxes: +((price + gst + vat).toFixed(2)),
            addon_details: addons,
            multi_details: multi,
            order_item_instruction: instruction,
            gst_percentage: item.item_gst,
            vat_percentage: item.item_vat,
            exclude_charge: +item.item_excluded_from_charge === 1 ? 'Y' : 'N',
            exclude_discount: +item.item_excluded_from_discount === 1 ? 'Y' : 'N',

            unit_price: price,
            item_name: item.item_name,
            brand_uuid: selectedMenu?.brand_uuid,
            cart_item_id: uuidv4()
        }

        generatedItem.addon_details?.forEach((addon) => delete addon.name);
        !generatedItem.order_item_instruction && delete generatedItem.order_item_instruction;

        return generatedItem;
    }

    function applyChargesDiscounts({ obj, order, useActualItemValues }) {

        let valuePercentage = +obj.percent;
        let base_price = 0;
        const calculateItemActualPrice = (i, calculateTax) => {
            let addonPrices = i?.addon_details?.reduce((sum, i) => sum + +i.price, 0) || 0
            let multiPrices = i?.multi_details?.reduce((sum, i) => sum + +i.price, 0) || 0
            let price = +i.order_item_unit_price + addonPrices + multiPrices

            if (calculateTax) {
                let parcel_qty = +i.order_item_parcel_type === 2 ? +i.order_item_qty : 1
                let parcelCharges = i.parcel === 'Y' ? (+i.order_item_unit_parcel_charge * parcel_qty) : 0
                let tax = ((price * +i.gst_percentage) / 100) + ((price * +i.vat_percentage) / 100)
                price = ((price + tax) * +i.order_item_qty) + parcelCharges
            } else price *= +i.order_item_qty

            return price
        }

        if (obj.type === 'C') {

            const filterKotItems = i => +i.order_item_status !== 2 && (i.exclude_charge === 'N' || obj.amt)
            console.log("order total before adding current charge", +order.order_total, +order.total_tax_gst, +order.total_tax_vat);
            let items_total = order.order_kot_details?.reduce((total, kot) => total + +kot.kot_items_details
                ?.filter(filterKotItems)
                ?.reduce((sum, i) => sum + (+i.order_item_unit_price * +i.order_item_qty), 0), 0)

            if (obj.amt) {
                valuePercentage = (+obj.amt * 100) / +items_total
                console.log('given value is in amt')
                console.log(`calculated percentage: ${valuePercentage}%; Where given amount`, +obj.amt, `is ${valuePercentage}% of items total`, items_total)
            }

            order.order_kot_details.forEach(kot_order => {

                kot_order.kot_items_details?.filter(filterKotItems)?.forEach(item => {

                    console.log('')
                    console.log(`calculating discounts for item:${item?.item_uuid}, KOT:${kot_order?.kot}`)

                    if (useActualItemValues || !item.charges_and_discounts) item.charges_and_discounts = [];
                    const item_price = (+item.order_item_unit_price * +item.order_item_qty)
                    const calculatedCharge = +((item_price * +valuePercentage) / 100).toFixed(2)
                    base_price += item_price

                    console.log("calculated charge", calculatedCharge, "which is : ", +valuePercentage + '% of', item_price)
                    if (obj.amt) console.log(`applied charge is ${(calculatedCharge * 100) / +obj.amt}% of`, +obj.amt)

                    item.order_item_taxable_value = (useActualItemValues ? calculateItemActualPrice(item) : +item.order_item_taxable_value) + calculatedCharge
                    item.order_item_amount_inclusive_taxes = (useActualItemValues ? calculateItemActualPrice(item, true) : +item.order_item_amount_inclusive_taxes) + calculatedCharge

                    item.charges_and_discounts.push({
                        ...obj,
                        equivalent_amt: calculatedCharge,
                        ref: uuidv4()?.slice(0, 8)
                    })

                    console.log('item excluded status', item.exclude_discount);
                    console.log("current item price", item.order_item_unit_price);
                    console.log("base_price after adding current item", base_price);
                    console.log('-----------------------------------------------------')
                })
            })

            order = calculateOrderValues(order)
            console.log("order_total after adding current charges", +order.order_total, +order.total_tax_gst, +order.total_tax_vat);
        }
        else if (obj.type === 'D') {

            const filterKotItems = i => +i.order_item_status !== 2 && (i.exclude_discount === 'N' || obj.amt)
            let items_total = order.order_kot_details?.reduce((total, kot) => total + +kot.kot_items_details
                ?.filter(filterKotItems)
                ?.reduce((sum, i) => sum + (useActualItemValues
                    ? calculateItemActualPrice(i, true)
                    : +i.order_item_amount_inclusive_taxes
                ), 0), 0)

            if (obj.amt) {
                valuePercentage = (+obj.amt * 100) / +items_total
                console.log('given value is in amt')
                console.log(`calculated percentage: ${valuePercentage}%; Where given amount`, +obj.amt, `is ${valuePercentage}% of items total`, items_total)
            }

            console.log("order total before deducting current discount", +order.order_total, +order.total_tax_gst, +order.total_tax_vat);
            order.order_kot_details.forEach(kot_order => {

                kot_order.kot_items_details?.filter(filterKotItems)?.forEach(item => {

                    console.log('')
                    console.log(`calculating discounts for item:${item?.item_uuid}, KOT:${kot_order?.kot}`)

                    if (useActualItemValues || !item.charges_and_discounts) item.charges_and_discounts = [];
                    const equivalent_amt = ((useActualItemValues ? calculateItemActualPrice(item) : (+item.order_item_taxable_value)) * valuePercentage) / 100
                    item.charges_and_discounts.push({
                        ...obj,
                        equivalent_amt: +equivalent_amt.toFixed(2),
                        ref: uuidv4()?.slice(0, 8)
                    })

                    if (obj.amt) console.log(`applicable discount is ${(equivalent_amt * 100) / +obj.amt}% of`, +obj.amt)
                    const item_price = useActualItemValues ? calculateItemActualPrice(item) : (+item.order_item_taxable_value)
                    const item_unit_gst = useActualItemValues ? (+item.order_item_unit_price * +item.gst_percentage) / 100 : (+item.order_item_unit_gst)
                    const item_unit_vat = useActualItemValues ? (+item.order_item_unit_price * +item.vat_percentage) / 100 : (+item.order_item_unit_vat)
                    base_price += item_price

                    const calculatedDiscount = (item_price * valuePercentage) / 100
                    const calculatedDiscountOnUnitGST = (item_unit_gst * valuePercentage) / 100
                    const calculatedDiscountOnUnitVAT = (item_unit_vat * valuePercentage) / 100

                    console.log("calculated discount", calculatedDiscount, "which is : ", valuePercentage + '% of', item_price)
                    console.log("calculated discount on unit gst", calculatedDiscountOnUnitGST, "which is : ", valuePercentage + '% of', item_unit_gst)
                    console.log("calculated discount on unit vat", calculatedDiscountOnUnitVAT, "which is : ", valuePercentage + '% of', item_unit_vat)

                    item.order_item_taxable_value = +(item_price - calculatedDiscount).toFixed(2)
                    item.order_item_unit_gst = +(item_unit_gst - calculatedDiscountOnUnitGST).toFixed(2)
                    item.order_item_unit_vat = +(item_unit_vat - calculatedDiscountOnUnitVAT).toFixed(2)
                    item.order_item_amount_inclusive_taxes = +(
                        (item_price - calculatedDiscount) +
                        (((item_unit_gst - calculatedDiscountOnUnitGST) +
                            (item_unit_vat - calculatedDiscountOnUnitVAT)
                        ) * +item.order_item_qty)
                    ).toFixed(2)

                    console.log('item excluded status', item.exclude_discount);
                    console.log("current item price", item.order_item_unit_price);
                    console.log("base_price after adding current item", base_price);
                    console.log('-----------------------------------------------------')
                })
            })

            order = calculateOrderValues(order)
            console.log("order_total after deducting current discount", +order.order_total, +order.total_tax_gst, +order.total_tax_vat);
        }

        if (!obj.amt) obj.equivalent_amt = +(base_price * (+obj.percent / 100)).toFixed(2)
        console.log({ order, obj });
        return { order, obj };
    }

    function generateMenuData(menu, categories, items) {

        menu.category_and_items.forEach(subMenuObj => {


            const categoryObj = categories.find(json => json.category_uuid === subMenuObj.category_uuid);

            // console.log(categoryObj);
            if (!categoryObj) console.log("No category found;", categoryObj, "for menu category uuid : ", subMenuObj?.category_uuid);

            subMenuObj.category_name = categoryObj?.category_name;
            subMenuObj.menu_items.forEach((menuItem, index, array) => {

                if (array.length === 0) return;
                let ItemObj = items.find(json => json.item_uuid === menuItem.item_uuid);

                if (!ItemObj) return;
                menuItem.item_name = ItemObj.item_name;
                menuItem.item_mode = ItemObj.item_mode;
                menuItem.category_uuid = subMenuObj.category_uuid;

                let ItemDetailsObj = ItemObj.outlet_wise_item_details.find(obj => obj.outlet_uuid === menu.outlet_uuid);

                menuItem.addons = [];
                menuItem.selected_multi = [];
                menuItem.parcel = 'N';
                menuItem.item_code = ItemDetailsObj.other_details?.item_code;
                menuItem.item_status = ItemDetailsObj.other_details?.item_status;
                menuItem.item_gst = ItemDetailsObj.other_details?.item_gst;
                menuItem.item_vat = ItemDetailsObj.other_details?.item_vat;
                menuItem.item_costing = ItemDetailsObj.other_details?.item_costing;
                menuItem.item_parcel_type = ItemDetailsObj.other_details?.item_parcel_type;
                menuItem.item_availability = ItemDetailsObj.other_details?.item_availability;
                menuItem.item_excluded_from_charge = ItemDetailsObj.other_details?.item_excluded_from_charge;
                menuItem.item_excluded_from_discount = ItemDetailsObj.other_details?.item_excluded_from_discount;
            })
        })
        return menu;
    };

    function generateMenues() {

        if (+localStorage.getItem('user_type') === 3) return;
        let DBOpenReq = indexedDB.open("FoodDo", +localStorage.getItem("IDBVersion") || 1);
        DBOpenReq.addEventListener("success", (idb) => {

            let db = idb.target.result;
            let tx = db.transaction("category", "readonly");
            let store = tx.objectStore("category");
            let getCategory = store.getAll();

            getCategory.onsuccess = (categoryReq) => {
                let categories = categoryReq.target.result;

                tx = db.transaction("item", "readonly");
                store = tx.objectStore("item");
                let getItems = store.getAll();

                getItems.onsuccess = (itemsReq) => {
                    let items = itemsReq.target.result;
                    let brandsCollection = [];
                    let menuesCollection = [];

                    tx = db.transaction("brand", "readonly");
                    store = tx.objectStore("brand");

                    let getBrand = store.getAll();
                    getBrand.onsuccess = (brandsReq) => {
                        tx = db.transaction("menu", "readonly");
                        store = tx.objectStore("menu");

                        let getMenu = store.getAll();
                        getMenu.onsuccess = (menuReq) => {
                            let menues = menuReq.target.result;
                            menues.forEach((menu, i) => {
                                const brandObj = brandsReq.target.result.find(
                                    (json) => json.brand_uuid === menu.brand_uuid
                                );
                                if (brandObj) {
                                    const existing = brandsCollection.find(
                                        (brand) => brand.brand_uuid === brandObj.brand_uuid
                                    );

                                    if (!existing)
                                        brandsCollection.push({
                                            brand_uuid: brandObj.brand_uuid,
                                            brand_name: brandObj.brand_name,
                                            for_menues: [menu.menu_uuid],
                                        });
                                    else {
                                        existing.for_menues.push(menu.menu_uuid);
                                        brandsCollection = brandsCollection.filter(
                                            (brand) => brand.brand_uuid !== brandObj.brand_uuid
                                        );
                                        brandsCollection.push(existing);
                                    }
                                }

                                const generatedMenu = generateMenuData(
                                    menu,
                                    categories,
                                    items
                                );
                                // console.log("Generated menu", generatedMenu);
                                menuesCollection.push(generatedMenu);

                                if (++i === menues.length) {
                                    const dataCollection = {
                                        brands: brandsCollection,
                                        menues: menuesCollection,
                                    };
                                    // console.log("Generated data collection : ", dataCollection);
                                    setMenusCollection(dataCollection)
                                    sessionStorage.setItem("generated-collection", JSON.stringify(dataCollection));
                                }
                            });
                        };
                    };
                };
            };
        })
    }

    function putMultipleOrdersInDB() {

        // console.log('put orders function called')
        const old_orders_ids = JSON.parse(localStorage.getItem("unposted_orders_ids")) || [];
        // console.log("worked till here", old_orders_ids);
        if (!old_orders_ids) return console.log("no unposted orders found", old_orders_ids);

        // console.log("passed return");

        function callAPI(content, db) {

            // console.log("updated orders collection", content)
            if (content.length < 1) return;

            // console.log('making fetch api call')
            axios({
                method: "put",
                url: "https://api.myfooddo.com/order/putOrder",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                data: content,
            }).then(res => {

                const response = res.data;
                // console.log('fetch api call completed : ', response)

                let new_orders_ids = JSON.parse(localStorage.getItem("unposted_orders_ids"));

                // console.log("old_orders_ids", old_orders_ids);
                // console.log("new_orders_ids", new_orders_ids);

                let tx = db.transaction("Orders", "readwrite");
                let store = tx.objectStore("Orders");

                new_orders_ids.forEach(i => {

                    if (response.result.includes(i.order_uuid))
                        if (i.path === "API") {
                            store.delete(i.order_uuid);
                            // console.log('deleting order from idb')
                        }
                        else if (i.path === "IDB") {

                            const order_json = content.find(c => c.order_uuid === i.order_uuid);
                            order_json.IDENTIFIER = i.order_uuid;

                            delete order_json.POSTED;
                            delete order_json.UPDATED_AT;
                            delete order_json.IsSynched;
                            delete order_json.Sync_Type;
                            delete order_json.IndexDbSts;
                            delete order_json.SRC;
                            store.put(order_json);
                        }
                });

                const new_data = new_orders_ids.filter(id => !response.result.includes(id.order_uuid));

                // console.log("new_filtered_orders_ids", new_data);
                localStorage.setItem("unposted_orders_ids", JSON.stringify(new_data));
            })
        }

        const orders = [];
        let DBOpenReq = indexedDB.open("FoodDo", +localStorage.getItem("IDBVersion") || 1);
        DBOpenReq.addEventListener("error", (err) => { console.warn(err); });
        DBOpenReq.addEventListener("success", (ev) => {

            let db = ev.target.result;
            let tx = db.transaction("Orders", "readwrite");
            let store = tx.objectStore("Orders");

            old_orders_ids.forEach((data, i, array) => {

                let orderReq = store.get(data.order_uuid);
                orderReq.onsuccess = orderEvent => {
                    const json = orderEvent.target.result;

                    if (!json) return;

                    delete json.IDENTIFIER;
                    delete json.POSTED;
                    delete json.UPDATED_AT;
                    delete json.IsSynched;
                    delete json.Sync_Type;
                    delete json.IndexDbSts;
                    delete json.SRC;
                    orders.push(json);

                    if (i + 1 === array.length)
                        callAPI(orders, db);
                }
            })
        })
    }

    function putOrdersTimeout() {

        const pastTimeout = sessionStorage.getItem('put-orders-timeout-id')
        if (pastTimeout)
            clearTimeout(+pastTimeout);

        const id = setTimeout(() => {
            putMultipleOrdersInDB();
        }, 30000);

        // console.log("timeout settted");
        sessionStorage.setItem('put-orders-timeout-id', id);
    }

    async function putOrderInDB(order) {

        delete order.IDENTIFIER;
        delete order.POSTED;
        delete order.UPDATED_AT;
        delete order.IsSynched;
        delete order.Sync_Type;
        delete order.IndexDbSts;
        delete order.SRC;

        const db = await openDB("FoodDo", +localStorage.getItem('IDBVersion') || 1);
        const store = db.transaction("Orders", "readwrite").objectStore("Orders");

        // console.log("updated orders collection", order)
        if (order.length < 1) return;
        axios({
            method: "put",
            url: "https://api.myfooddo.com/order/putOrder",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            data: [order],
        }).then(result => {
            const response = result.data;
            if (response.result.includes(order.order_uuid))
                store.delete(order.order_uuid);
        })
    }

    function toggleAlarm(trigger) {

        if (trigger) {
            if (!sessionStorage.getItem("alarm-interval-id")) {

                clearInterval(sessionStorage.getItem("alarm-interval-id"))
                const id = setInterval(() => {
                    if (+localStorage.getItem("refresh_status") === 0) {

                        let audio = new Audio(AlertAudio);
                        audio.play();
                        // console.log(audio);
                    }
                }, 4000);
                sessionStorage.setItem("alarm-interval-id", id);
            }
        }
        else {

            // console.log("cancelling alarm");
            clearInterval(sessionStorage.getItem("alarm-interval-id"));
            sessionStorage.removeItem("alarm-interval-id");
        }
    }

    async function deleteOrder(id) {

        const page = window.location.pathname;
        // console.log(id);
        if (page.includes("/page1")) {
            let onorderSeats = await JSON.parse(localStorage.getItem("onorder_seats")) || [];

            const seat = onorderSeats?.find(i => i.uuid === id)?.seat_uuid;
            onorderSeats = await onorderSeats.filter(i => i.uuid !== id)

            // console.log(onorderSeats);
            localStorage.setItem("onorder_seats", JSON.stringify(onorderSeats));

            if (seat) {
                let unplacedSeatOrder = await JSON.parse(localStorage.getItem("unplaced_orders")) || [];
                unplacedSeatOrder = await unplacedSeatOrder.filter(i => i.seat !== seat)

                // console.log(unplacedSeatOrder);
                localStorage.setItem("unplaced_orders", JSON.stringify(unplacedSeatOrder));
            }
        }
        else if (page.includes("/orders")) {
            let extendedNonSeatOrder = await JSON.parse(localStorage.getItem("extended-nonseat-order")) || [];
            extendedNonSeatOrder = await extendedNonSeatOrder.filter(i => i.id !== id)

            // console.log(extendedNonSeatOrder);
            localStorage.setItem("extended-nonseat-order", JSON.stringify(extendedNonSeatOrder));
        }

        let DBOpenReq = indexedDB.open("FoodDo", +localStorage.getItem("IDBVersion") || 1);
        DBOpenReq.addEventListener("error", (err) => console.warn(err));
        DBOpenReq.addEventListener("success", (ev) => {

            let db = ev.target.result;
            let tx = db.transaction("running_orders", "readwrite");
            let store = tx.objectStore("running_orders");

            // console.log(id)
            store.delete(id);

            if (page.includes("/page1"))
                setForceRenderPage1(uuidv4() + uuidv4());
            else if (page.includes("/orders"))
                setForceRenderOrdersPage(uuidv4() + uuidv4());

            FBConfig.remove(FBConfig.ref(FBConfig.db, localStorage.getItem("outlet_uuid") + "/RunnigOrders/" + id)
            ).then(i => {
                // console.log("order removed from firebas : ", i);

            }).catch(error => console.log(error))
        })
    }

    async function switchTable(currentSeat, targetSeat) {

        let onorderSeats = await JSON.parse(localStorage.getItem("onorder_seats")) || [];
        onorderSeats = await onorderSeats.map(i => i.seat_uuid === currentSeat ? { ...i, seat_uuid: targetSeat } : i);
        localStorage.setItem("onorder_seats", JSON.stringify(onorderSeats));

        let unplacedSeatOrder = await JSON.parse(localStorage.getItem("unplaced_orders")) || [];
        unplacedSeatOrder = await unplacedSeatOrder.map(i => i.seat === currentSeat ? { ...i, seat: targetSeat } : i)

        localStorage.setItem("unplaced_orders", JSON.stringify(unplacedSeatOrder));

        let DBOpenReq = indexedDB.open("FoodDo", +localStorage.getItem("IDBVersion") || 1);
        DBOpenReq.addEventListener("error", (err) => console.warn(err));
        DBOpenReq.addEventListener("success", (ev) => {

            let db = ev.target.result;
            let tx = db.transaction("running_orders", "readwrite");
            let store = tx.objectStore("running_orders");

            const getReq = store.getAll()
            getReq.onsuccess = orderEvent => {
                const orders = orderEvent.target.result?.filter(i => i.seat_uuid === currentSeat);
                orders?.forEach(order => {
                    order.seat_uuid = targetSeat;
                    store.put(order);
                    setForceRenderPage1(uuidv4() + uuidv4());
                    FBConfig.set(
                        FBConfig.ref(FBConfig.db, localStorage.getItem("outlet_uuid") + "/RunnigOrders/" + order.order_uuid + "/seat_uuid"),
                        targetSeat
                    )
                        .then(i => {
                            console.log("order seat switched on firebase : ", i);
                        }).catch(error => console.log(error))
                })
            }
        })
    }

    const updateOrderCustomer = async () => {
        const updates = await JSON.parse(localStorage.getItem("customers-orders-info"))
        if (!updates) return console.error("No updates found for customers info");

        let keysLength = Object.keys(updates)?.length || 0;
        let DBOpenReq = indexedDB.open("FoodDo", +localStorage.getItem("IDBVersion") || 1);
        DBOpenReq.addEventListener("error", (err) => { console.warn(err); });
        DBOpenReq.addEventListener("success", (ev) => {

            let db = ev.target.result;
            let tx = db.transaction("running_orders", "readwrite");
            let store = tx.objectStore("running_orders");

            // for (const id in updates) {
            Object.keys(updates)?.forEach(id => {

                const contact = updates[id];
                // console.log(contact);

                const getReq = store.get(id)
                getReq.onsuccess = getEvent => {
                    const order = getEvent.target.result;
                    if (!order) {
                        delete updates[id];
                        if (--keysLength === 0) localStorage.setItem("customers-orders-info", JSON.stringify(updates))
                        return;
                    }
                    if (contact.customer_mobile || contact.customer_mobile === "")
                        order.customer_mobile = contact.customer_mobile;

                    if (contact.customer_name)
                        order.customer_name = contact.customer_name;

                    order.IsSynched = 0;
                    // console.log("updated contact info in order json", order);
                    store.put(order);

                    // console.log("updated collection", updates, keysLength)
                    delete updates[id];
                    if (--keysLength === 0) localStorage.setItem("customers-orders-info", JSON.stringify(updates))
                }
            })
        })
    }

    const updateCustomerData = async (callback) => {
        const updates = await JSON.parse(localStorage.getItem("customers-data"))
        if (!updates) return console.error("No updates found for customers data");

        let length = Object.keys(updates).length;
        let DBOpenReq = indexedDB.open("FoodDo", +localStorage.getItem("IDBVersion") || 1);
        DBOpenReq.addEventListener("error", (err) => { console.warn(err); });
        DBOpenReq.addEventListener("success", (ev) => {

            let db = ev.target.result;

            Object.keys(updates)?.forEach(id => {
                const contact = updates[id];
                // console.log(contact);

                let customersStore = db.transaction("customer", "readwrite").objectStore("customer");
                const getReq = customersStore.get(id)
                getReq.onsuccess = getEvent => {

                    const customer = getEvent.target.result;
                    customer.outlet_wise_customer_details = customer.outlet_wise_customer_details
                        .map(detail =>
                            detail.outlet_uuid === localStorage.getItem("outlet_uuid") ?
                                { ...detail, customer_outlet_address: contact.customer_outlet_address }
                                : detail)

                    // console.log("updated contact info in customer json", customer);
                    customersStore.put(customer);

                    if (contact.uuid) {
                        let ordersStore = db.transaction("running_orders", "readwrite").objectStore("running_orders");
                        const orderReq = ordersStore.get(contact.uuid);
                        orderReq.onsuccess = orderEvent => {
                            const order = orderEvent.target.result;

                            order.IsSynched = 0;
                            order.delivery_address = contact.customer_outlet_address;
                            ordersStore.put(order);
                        }
                    } length--;

                    delete updates[id];
                    // console.log("updated collection", updates, length)

                    if (length === 0) {
                        localStorage.setItem("customers-data", JSON.stringify(updates))
                        callback();
                    }
                }
            })
        })
    }

    const upload_backup = async () => {

        const db = await openDB("FoodDo", +localStorage.getItem("IDBVersion") || 1);
        const collections = [...db.objectStoreNames];
        const generated_backup = {};

        // console.log([...collections]);
        collections.forEach(async collection => {
            let store = db.transaction(collection, "readonly").objectStore(collection);
            generated_backup[collection] = await store.getAll();

            if (Object.keys(generated_backup).length === collections.length) {
                // console.log("generated backup", generated_backup);

                fetch("http://127.0.0.1:7878/backup-list", {
                    // fetch("http://127.0.0.1:7878/backup-list", {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                    .then(res => {
                        if (+res.status === 200)
                            return res.json()
                        else if (+res.status === 404)
                            return null
                    })
                    .then(list => {

                        let sr_no;

                        if (list)
                            sr_no = +list
                                ?.sort((a, b) => +a.split("-")[0] < +b.split("-")[0] ? 1 : -1)[0]
                                ?.split("-")[0] || 0;
                        else
                            sr_no = 0

                        sr_no = sr_no + 1;
                        // console.log("serial number", sr_no);
                        const d = new Date();
                        const currentFolder = `${sr_no}-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;
                        // console.log("currentFolder", currentFolder);

                        fetch("http://127.0.0.1:7878/upload-pos-backup", {
                            // fetch("http://127.0.0.1:7878/upload-pos-backup", {
                            method: "post",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                data: generated_backup,
                                currentFolder,
                                dir: "backup",
                                limit: 60
                            }),
                        })
                            .then(res => {
                                if (+res.status === 200)
                                    return res.json();
                                else {
                                    return null;
                                }
                            })
                            .then(res => {

                                if (!res) return;
                                // console.log(res);
                                showWarning({
                                    message: "Local Backup Performed",
                                    class: "active-green"
                                })
                            })
                            .catch((err) => console.log(err));
                    })
                    .catch((err) => console.log(err));
            }
        })
    }

    const updateStocksUnsyncedFiles = async items => {
        const db = await openDB("FoodDo", +localStorage.getItem('IDBVersion') || 1);
        for (const item of items) {
            let store = db.transaction("unsynced_files", "readwrite").objectStore("unsynced_files");
            let unsynced_item = (await store.get(`item_stock:${item.item_uuid}`)) || {}
            let consumed_qty = unsynced_item?.consumed_qty
                ? +unsynced_item.consumed_qty + +item.order_item_qty
                : +item.order_item_qty

            store.put({
                ...unsynced_item,
                BACKUP: 0,
                IDENTIFIER: `item_stock:${item.item_uuid}`,
                outlet_uuid: localStorage.getItem('outlet_uuid'),
                item_uuid: item.item_uuid,
                type: 'POS',
                consumed_qty
            })
        }
    }

    const calculateOrderValues = (json, handleChargeDiscount, keepKotStatus) => {

        let decimal_length = +sessionStorage.getItem("decimal_length")
        const orderKOTs = json.order_kot_details?.map(order_kot => {
            const kotValidItems = order_kot.kot_items_details?.filter(i => +i.order_item_status < 2)
            return {
                ...order_kot,
                kot_total: +(kotValidItems?.reduce((sum, i) => sum + (+i.order_item_amount_inclusive_taxes), 0).toFixed(2)),
                kot_gst: +(kotValidItems?.reduce((sum, i) => sum + (+i.order_item_unit_gst * +i.order_item_qty), 0).toFixed(2)),
                kot_vat: +(kotValidItems?.reduce((sum, i) => sum + (+i.order_item_unit_vat * +i.order_item_qty), 0).toFixed(2)),
                kot_status: keepKotStatus ? order_kot?.kot_status : order_kot?.kot_items_details?.some(i => +i.order_item_status === 0) ? 0 : 1
            }
        })

        json.order_kot_details = orderKOTs
        json.preparation_status = orderKOTs.some(kot => +kot.kot_status === 0) ? 0 : 1

        if (json.payment_status === 1 || json.payment_status === 2 || json.payment_status === 3)
            if (json.preparation_status === 1 || json.preparation_status === 2)
                if (!json.delivery_status || json.delivery_status !== 0)
                    json.order_status = 4;
                else json.order_status = 3;
            else json.order_status = 3;
        else json.order_status = 3;

        json.order_total = +(json.order_kot_details?.reduce((sum, i) => sum + +i.kot_total, 0).toFixed(decimal_length));
        json.total_tax_gst = +(json.order_kot_details?.reduce((sum, i) => sum + +i.kot_gst, 0).toFixed(2));
        json.total_tax_vat = +(json.order_kot_details?.reduce((sum, i) => sum + +i.kot_vat, 0).toFixed(2));

        // Charges and discounts calculations
        if (handleChargeDiscount && json.charges_and_discounts?.[0]) {
            const res = applyChargesDiscounts({ obj: json.charges_and_discounts[0], order: json, useActualItemValues: true });
            json = res.order;
            json.charges_and_discounts?.slice(1)?.forEach(obj => {
                delete obj.id;
                const res = applyChargesDiscounts({ obj, order: json });
                json = res.order;
            });
        }

        console.log({ json })
        return json;
    }

    function new_kotOrder({ json, outlet, time, buttonStatus, itemsList, cartItems }) {

        if (!json.order_kot_details) json.order_kot_details = [];
        let kot_type = sessionStorage.getItem("kot_type");
        let value = `${buttonStatus}`;

        if (+kot_type === 2 && +buttonStatus === 0) value = "1";
        console.log({ value })
        const series = outlet.invoice_series.find((series) => series.user_uuid === localStorage.getItem("user_uuid"));
        let order_kot = {
            kot: Number(series.next_kot_number),
            user_uuid: localStorage.getItem("user_uuid"),
            created_at: time,
            kot_total: 0,
            kot_gst: 0,
            kot_vat: 0,
            kot_status: value,
            kot_items_details: cartItems?.map(({
                item_name, unit_price, brand_uuid, cart_item_id, ...item
            }) => ({ ...item, order_item_status: value, kot_item_uuid: cart_item_id })),
        };

        updateStocksUnsyncedFiles(cartItems)
        json.order_kot_details.push(order_kot);
        json = calculateOrderValues(json)

        if (json.coupons?.[0]) {
            let order_coupons = [];
            json.coupons.forEach(coupon => {
                const scheme = schemes?.find(i => i.scheme_uuid === coupon.scheme_uuid)
                if (
                    !coupon.applied
                    && scheme.second_person.paymode_uuid === 'D'
                    && (!coupon.min_bill || +coupon.min_bill < +json.order_total)
                ) {

                    let discountedAmount;
                    if (scheme.second_person.discount_type === 'P')
                        discountedAmount = (+json.order_total * +scheme.second_person.value) / 100
                    else
                        discountedAmount = +scheme.second_person.value;

                    const discount = { type: "D", title: coupon.coupon_code }
                    if (+coupon.max_discount && discountedAmount > +coupon.max_discount)
                        discount.amt = +coupon.max_discount
                    else
                        if (scheme.second_person.discount_type === "A") discount.amt = discountedAmount;
                        else if (scheme.second_person.discount_type === "P") discount.percent = discountedAmount;

                    order_coupons.push(discount)
                }
            })

            json.charges_and_discounts = (json.charges_and_discounts || []).concat(order_coupons)
            json.coupons = json.coupons.map(i => order_coupons.find(j => j.title === i.coupon_code) ? ({ ...i, applied: 1 }) : i)
        }

        // Charges and discounts calculations
        if (json.charges_and_discounts?.[0]) {
            const res = applyChargesDiscounts({ obj: json.charges_and_discounts[0], order: json, useActualItemValues: true });
            json = res.order;
            json.charges_and_discounts?.slice(1)?.forEach(obj => {
                delete obj.id;
                const res = applyChargesDiscounts({ obj, order: json });
                json = res.order;
            });
        }

        console.log(
            "order final values",
            +json.order_total,
            +json.total_tax_gst,
            +json.total_tax_vat
        );

        return json;
    }

    // Create a complete new order (CALLED IN 'createJson' when no running order is found)
    function new_order({ outlet, buttonStatus, customerAddress, order_type, order_uuid, cartItems, brand_uuid, seat_uuid, customerInfo }) {

        const series = outlet.invoice_series.find(
            (series) => series.user_uuid === localStorage.getItem("user_uuid")
        );

        // console.log(series);

        let json = {};
        let time = Date.now();
        json.Sync_Type = 'NEW';
        json.created_at = time;

        if (brand_uuid) json.brand_uuid = brand_uuid;
        else json.brand_uuid = JSON.parse(sessionStorage.getItem("brand"))?.brand_uuid;

        json.customer_mobile = customerInfo?.number || '';
        json.customer_name = customerInfo?.name || '';
        json.local_order_id = `${series.series}${Number(series.next_order_number)}`;
        json.payment_status = 0;
        json.preparation_status = 0;
        json.order_status = 3;
        json.order_total = 0;
        json.total_tax_gst = 0;
        json.total_tax_vat = 0;
        json.outlet_uuid = outlet.outlet_uuid;
        json.working_day = outlet.current_working_day;

        if (customerAddress) json.delivery_address = customerAddress;

        json.order_type = +order_type;
        json.order_uuid = order_uuid;
        // console.log("order type", json.order_type);

        if (+order_type === 0)
            if (seat_uuid) json.seat_uuid = seat_uuid;
            else json.seat_uuid = sessionStorage.getItem("seat");

        json.order_kot_details = [];
        json.invoice_prints = [];
        json.modified_at = time;
        json.IDENTIFIER = json.order_uuid;

        json = new_kotOrder({ json, outlet, time, buttonStatus, cartItems });

        if (+order_type === 0) {
            let onorder_seats = JSON.parse(localStorage.getItem("onorder_seats")) || [];
            let object = {
                seat_uuid: json.seat_uuid,
                created_at: json.created_at,
                price: json.order_total,
                title: json.local_order_id,
                uuid: json.order_uuid
            };
            onorder_seats.push(object);
            localStorage.setItem("onorder_seats", JSON.stringify(onorder_seats));
        }

        console.log({ json })
        return json;
    }

    const fetchImage = async ({ setState, url }) => {
        const res = await fetch(url, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })
        if (res.ok)
            setState(url);
    }

    const uploadImage = async ({ image, url, callback }) => {
        try {
            const form = new FormData();
            form.append('image', image);

            const res = await fetch(url, {
                method: "POST",
                body: form,
            })

            if (res.ok) {
                console.log('%cImage Uploaded Successfully', 'color:limegreen; font-weight:bolder')
                if (callback)
                    await callback()
            }
            return
        }
        catch (error) {
            console.error("Couldn't upload logo", error)
            return
        }
    }

    const selectMenu = (param, menu_type, callback) => {

        if (!menusCollection?.menues?.[0]) return showWarning({
            message: 'Please Wait, Menus are loading...',
            classname: 'active-orange'
        })
        setSelected_category('All');

        let menu = menusCollection?.menues?.filter(i => i.menu_type?.filter(t => +t !== 5)?.length)
        if (+menu_type === 0 && param.menu_uuid) menu = menu?.find(i => i.menu_uuid === param.menu_uuid)
        else if (+menu_type === 0 && param.brand_uuid) menu = menu?.find(i => i.brand_uuid === param.brand_uuid)
        else if (param?.brand_uuid) menu = menu?.find(i => i.menu_type?.includes(`${menu_type}`) && i.brand_uuid === param.brand_uuid)
        else menu = menu?.find(i => i.menu_type?.includes(`${menu_type}`))

        if (!menu) return showWarning({
            message: 'No menu applied',
            classname: 'active-red'
        });

        const category_and_items = menu?.category_and_items?.filter(category => {
            category.menu_items = category.menu_items.filter(menu_item =>
                +menu_item.menu_item_status === 1 &&
                +menu_item.item_availability === 1 &&
                +menu_item.item_status === 1)
            if (category.menu_items.length > 0) return category
            else return null
        });

        sessionStorage.setItem("current_menu", menu.menu_uuid);
        setSelectedMenu({ ...menu, category_and_items })
        callback && callback()
    }

    let afterPrintCallback = null;
    const handleInvoicePrint = useReactToPrint({
        content: () => invoicePrintElemRef.current,
        documentTitle: "Invoice",
        onAfterPrint: () => afterPrintCallback && afterPrintCallback(),
        removeAfterPrint: true
    });

    const handleKotPrint = useReactToPrint({
        content: () => kotPrintElemRef.current,
        documentTitle: "Kot",
        onAfterPrint: () => afterPrintCallback && afterPrintCallback(),
        removeAfterPrint: true
    });

    const asyncInterval = async (callback, ms, triesLeft = 10) => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                if (callback()) {
                    clearInterval(interval);
                    resolve();
                } else if (triesLeft < 1) {
                    clearInterval(interval);
                    reject();
                }
                triesLeft--;
            }, ms);
        });
    }

    const PrintKotInvoice = async ({ dependencies, item_groups, callback }) => {

        const { kot_setup, kotNumber, order_json } = await dependencies
        const kotPrinters = await kot_setup.printer_setup
        const renderCycleID = uuidv4()
        const printServer = "http://127.0.0.1:7878/print"

        console.log({ dependencies, renderCycleID })
        setKotPrintDependencies({ ...dependencies, renderCycleID })

        try {
            await asyncInterval(() => sessionStorage.getItem('kot-print-render-cycle-id') === renderCycleID, 500, 20);
        } catch (e) { return }

        console.log("Done!");
        let processCount = 0
        const respondToCallback = () => {
            console.log(`Process: ${++processCount}/${kotPrinters?.length * 2}`)
            if (processCount === kotPrinters?.length * 2 && callback) callback()
        }

        await kotPrinters?.forEach(printer => {

            document.getElementById('kot-print-heading').innerText = printer.kot_heading
            const item_group = item_groups?.find((group) => group.item_group_uuid === printer.item_group_uuid)

            if (parseInt(printer.copies) && printer?.item_group_uuid && item_group) {

                let kotItemDetails = order_json?.order_kot_details
                    ?.find(item1 => item1.kot === +kotNumber)?.kot_items_details
                    ?.filter(item3 => item_group?.items.find(item4 => item4 === item3.item_uuid))

                if (!kotItemDetails?.length) return respondToCallback()
                Array.from(document.getElementsByClassName('kot_print_items'))
                    ?.forEach(elem => {
                        const item_uuid = elem.id.split(':')?.filter(i => i)?.at(-1)
                        if (kotItemDetails?.find(i => i.item_uuid === item_uuid))
                            document.getElementById(elem.id).style.display = 'table-row'
                        else
                            document.getElementById(elem.id).style.display = 'none'
                    })

                axios({
                    method: "post",
                    url: printServer,
                    data: {
                        print_file: kotPrintElemRef.current.innerHTML,
                        printer_name: printer.printer_name,
                        page_configuration: { ...printer.page_configuration[0] },
                        copies: parseInt(printer.copies),
                        debug_print: true,
                        wk_params: "",
                        gs_params: "",
                    },
                })
                    .then(respondToCallback)
                    .catch(respondToCallback);
            }
            else if (parseInt(printer.copies) && (printer.item_group_uuid === "all" || printer.item_group_uuid === "") && printer.printer_name !== "0") {

                Array.from(document.getElementsByClassName('kot_print_items'))
                    ?.forEach(elem => document.getElementById(elem.id).style.display = 'table-row')

                axios({
                    method: "post",
                    url: printServer,
                    data: {
                        print_file: kotPrintElemRef.current?.innerHTML,
                        printer_name: printer.printer_name,
                        page_configuration: { ...printer.page_configuration[0] },
                        copies: parseInt(printer.copies),
                        debug_print: true,
                        wk_params: "",
                        gs_params: "",
                    },
                })
                    .then(respondToCallback)
                    .catch(respondToCallback)

            }
            else respondToCallback()
        });

        const browerPrintHandler = index => {

            console.log('function called with index: ', index)
            const callNext = () => {
                console.log('after print callback invoked')
                respondToCallback()
                afterPrintCallback = null
                kotPrinters?.[index + 1] && browerPrintHandler(index + 1)
            }

            const printer = kotPrinters?.[index]
            if (
                !printer
                || !parseInt(printer.copies)
                || !(printer.item_group_uuid === "all" || printer.item_group_uuid === "")
                || printer.printer_name !== "0"
                || !printer.page_configuration?.[0]
            ) return callNext()

            document.getElementById('kot-print-heading').innerText = printer.kot_heading
            Array.from(document.getElementsByClassName('kot_print_items'))
                ?.forEach(elem => document.getElementById(elem.id).style.display = 'table-row')

            afterPrintCallback = () => callNext();
            handleKotPrint();
        }
        browerPrintHandler(0)
    };

    const PrintInvoice = async ({ invoice_details, callback, dependencies }) => {

        const { num, ebill, browser_print, customer_mobile, bill_total } = await invoice_details
        const { invoice_setup } = await dependencies

        const renderCycleID = uuidv4()
        setInvoicePrintDependencies({ ...dependencies, renderCycleID })

        try {
            await asyncInterval(() => sessionStorage.getItem('invoice-print-render-cycle-id') === renderCycleID, 500, 20);
        } catch (e) { return }

        console.log('Data rendered', sessionStorage.getItem('invoice-print-render-cycle-id') === renderCycleID)
        if (browser_print) {
            afterPrintCallback = callback
            handleInvoicePrint()
            return
        }
        const htmlString = invoicePrintElemRef.current.innerHTML?.replace('</img>', '')?.replace('/>', '>')
        if (ebill === true) {
            if (!customer_mobile || customer_mobile === "") {
                showWarning({
                    message: "Mobile Number required for eBill",
                    classname: 'active-red'
                })
                return false
            };
            axios({
                method: "post",
                url: "https://api.myfooddo.com/eBill",
                // url: "http://localhost:5000/eBill",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    bill_total,
                    outlet_title: localStorage.getItem("outlet-name"),
                    html_view: htmlString,
                    user_phoneNo: customer_mobile
                },
            })
                .then(async res => {
                    callback()
                    const smsBalance = res?.data?.sms_balance
                    const db = await openDB("FoodDo", +localStorage.getItem("IDBVersion") || 1);
                    const tx = db.transaction("outlet", "readwrite").objectStore("outlet")
                    const outlet = (await tx.getAll())?.[0]
                    tx.put({ ...outlet, sms_balance: smsBalance })
                    if (smsBalance < 50)
                        showWarning({
                            message: `${smsBalance} SMS Credits Remaining`,
                            classname: 'active-orange',
                            time: 4000
                        })
                })
                .catch(callback);
        }
        else {
            axios({
                method: "post",
                url: "http://127.0.0.1:7878/print",
                data: {
                    print_file: htmlString,
                    printer_name: invoice_setup.printer_name,
                    page_configuration: {
                        ...invoice_setup.page_configuration,
                    },
                    copies: num,
                    debug_print: true,
                    wk_params: "",
                    gs_params: "",
                },
            })
                .then(() => setTimeout(callback, 5000))
                .catch(() => setTimeout(callback, 5000));
        }

        localStorage.removeItem("temp_order_id")
    }

    const generateCoupons = async (db, order_uuid, customer_mobile) => {

        // if (orderProps?.order_status_param === 4) return [];
        // if (page.includes('/page2') && page.includes('edit')) return [];

        console.log({ db, order_uuid, customer_mobile })
        if (!customer_mobile?.length) return [];
        console.log('order has customer mobile ', customer_mobile)

        let scheme_tx = db.transaction("scheme", "readwrite").objectStore("scheme");
        let schemes = await scheme_tx.getAll();
        schemes = schemes.filter(scheme => +scheme.scheme_status === 1);

        let coupon_tx = db.transaction("coupon", "readwrite").objectStore("coupon");
        const coupons_messages = []

        for (let count = 0; count < schemes.length; count++) {
            const { scheme_uuid, scheme_status, ...scheme } = await schemes[count];

            if (+scheme_status !== 1) return null;
            const valid_till =
                +scheme.valid_type === 0 ? 0
                    : `${scheme.valid_type}`.length === 13 ? +scheme.valid_type
                        : new Date(
                            new Date().setHours(0, 0, 0, 0) - (new Date().getTimezoneOffset() * 60 * 1000)
                        ).getTime() + (+scheme.valid_type * 24 * 60 * 60 * 1000)

            const coupon = {
                created_at: `${Date.now()}`,
                coupon_uuid: uuidv4(),
                coupon_code: Math.random().toString(36).slice(-8).toUpperCase(),
                customer_mobile,
                valid_till,
                scheme_uuid,
                order_uuid: order_uuid,
                outlet_uuid: localStorage.getItem('outlet_uuid'),
                coupon_status: 1
            }

            coupon_tx = db.transaction("coupon", "readwrite").objectStore("coupon");
            await coupon_tx.put({
                IDENTIFIER: coupon.coupon_uuid,
                ...coupon
            })

            let store = db.transaction("unsynced_files", "readwrite").objectStore("unsynced_files");
            await store.put({
                IDENTIFIER: `coupon-new:${coupon.coupon_uuid}`,
                BACKUP: 0,
                ...coupon
            })

            if (scheme?.message)
                coupons_messages.push(scheme.message?.replace('{COUPON-CODE}', coupon.coupon_code))
        }

        return coupons_messages
    }

    return (
        <Context.Provider value={{
            finalState, setFinalState,
            selectedMenu, setSelectedMenu,
            cartHandler,
            itemsState, setItemsState,
            seatsState, setSeatsState,
            applyChargesDiscounts, generateMenuData, generateMenues,
            forceRenderOrdersPage, setForceRenderOrdersPage,
            forceRenderPage1, setForceRenderPage1,
            forceRenderPage, setForceRenderPage,
            menuCategories, setMenuCategories,
            selected_category, setSelected_category,
            editedOrderData, setEditedOrderData,
            payment_popup_save_btns_ref, menusCollection, setMenusCollection,
            putOrderInDB, putMultipleOrdersInDB, putOrdersTimeout, itemChargesHandlerRef, itemChargesValueRef,
            currentOrderRef, orderRequestAlarm, triggerOrderRequestAlarm, toggleAlarm, deleteOrder, updateOrderCustomer, switchTable, updateCustomerData, setVideoPopUp, videoPopUp,
            inventoryPageContent, setInventoryPageContent, cursorItemRef, unAuthPopup, setUnAuthPopup, setUnSyncCount, unSyncCount, updateUnSync, newLoginData, setNewLoginData, flushData, setFlushData, upload_backup,
            new_order, new_kotOrder, addItemToCart, isBulkUploadOpen, setIsBulkUploadOpen, getBulkData, bulkUploadedData, setBulkUploadedData, fetchImage, uploadImage, showWarning, getAndUpdateUnsyncCount, selectMenu, orderProps, setOrderProps, PrintKotInvoice, kotPrintDependencies, setKotPrintDependencies, kotPrintElemRef, invoicePrintElemRef, invoicePrintDependencies, setInvoicePrintDependencies, PrintInvoice, generateCoupons, calculateOrderValues, runningOrders, setRunningOrders, sectionsState, setSectionsState
        }}>
            {props.children}
        </Context.Provider >
    )
}

export default State