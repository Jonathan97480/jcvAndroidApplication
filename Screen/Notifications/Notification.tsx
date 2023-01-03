import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GetAllNotifications } from '../../api';
import { deleteNotification, setAllNotification } from '../../redux/slice/notificationSlice';
import { CustomButton, Filters, MicroCard, ModalAddNotification, ModalNotification } from '../../components';
import { apiNotification } from '../../interface/api';
import { User } from '../../interface';
import { stylesGlobal } from '../../util/styleGlobal';
import { ScrollView } from 'react-native-gesture-handler';
import { DeleteNotification } from '../../api/notification';
import { filtersNotifications, fixeText, formatDateToForDisplay } from '../../util/function';



export default function Notification() {

    const user: User = useSelector((state: any) => state.user.user);
    const notifications: apiNotification[] = useSelector((state: any) => state.notification.notification);
    const dispatch = useDispatch();
    const [modalView, setModalView] = useState<boolean>(false);
    const [modalViewAddNotification, setModalViewAddNotification] = useState<boolean>(false);

    const [filterNotifications, setFilterNotifications] = useState<apiNotification[]>([]);
    const [curentNotification, setCurentNotification] = useState<apiNotification | undefined>(undefined);
    const [curentValueFilter, setCurentValueFilter] = useState<string>("active");





    useEffect(() => {
        if (notifications.length === 0) {
            GetAllNotifications(user).then((res) => {

                if (res.length === 0) return;

                const activeNotifications: apiNotification[] = filtersNotifications(res, curentValueFilter);
                dispatch(setAllNotification(res))
                setFilterNotifications(activeNotifications);

            });
        } else {
            const activeNotifications: apiNotification[] = filtersNotifications(notifications, curentValueFilter);
            setFilterNotifications(activeNotifications);
        }
    }, [notifications]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={[stylesGlobal.container, stylesGlobal.padding]} >
                <Text style={{ marginBottom: 20, fontWeight: "bold", textAlign: "center", fontSize: 20 }}>Liste des notifications</Text>

                <Filters
                    label='Filtrer par'
                    filter={[
                        { label: "Active", isDefault: true, value: "active" },
                        { label: "Validée", value: "validated" },
                        { label: "Avenir", value: "coming" },

                    ]}
                    params={
                        {
                            colorActive: "#2e64e5",
                            isUnderlineActive: true,
                        }
                    }
                    onPress={(value) => {
                        setCurentValueFilter(value);
                        const newNotificationFilter = filtersNotifications(notifications, value);
                        setFilterNotifications(newNotificationFilter);
                    }}
                />
                <ScrollView>
                    {
                        filterNotifications.map((notification: apiNotification) => {
                            return (
                                <MicroCard
                                    key={notification.id + "-notification"}
                                    title={fixeText(notification.title, 25, "...")}
                                    description={notification.description}
                                    status={formatDateToForDisplay(new Date(notification.date))}
                                    chevronDisabled={true}
                                    isSwipeable={true}
                                    onPress={() => {
                                        setCurentNotification(notification);
                                        setModalView(true);
                                    }}
                                    onDeletedPress={() => {

                                        DeleteNotification(notification.id, user).then((res) => {
                                            if (res)
                                                dispatch(deleteNotification(notification.id));
                                        })
                                    }}
                                    onEditPress={() => {
                                        setCurentNotification(notification);
                                        setModalViewAddNotification(true);
                                    }}
                                />
                            )
                        }
                        )
                    }
                </ScrollView>
                <CustomButton
                    label="Ajouter une notification"
                    onPress={() => {
                        setModalViewAddNotification(true);
                    }}
                    icon={undefined}
                />

            </View>
            {
                curentNotification &&
                <ModalNotification
                    visible={modalView}
                    setVisible={setModalView}
                    notification={curentNotification}
                />}
            <ModalAddNotification
                visible={modalViewAddNotification}
                setVisible={setModalViewAddNotification}
                notification={curentNotification}

            />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});