import { Util } from "types/@girs/atk-1.0/atk-1.0.cjs"
import { Notification } from "types/service/notifications"
import { getDominantColor } from "utils/image"
import { readJson } from "utils/json"

const Hyprland = await Service.import('hyprland')


/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
function NotificationIcon({ app_entry, app_icon, image })
{
    if (image) {
        return Widget.Box({
            css: `background-image: url("${image}");`
                + "background-size: contain;"
                + "background-repeat: no-repeat;"
                + "background-position: center;"
                + `box-shadow: 0 0 5px 0 ${getDominantColor(image)};`
        })
    }

    let icon = "dialog-information-symbolic"
    if (Utils.lookUpIcon(app_icon))
        icon = app_icon

    if (app_entry && Utils.lookUpIcon(app_entry))
        icon = app_entry

    return Widget.Box({
        child: Widget.Icon(icon),
    })
}

/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
export function Notification_(n: Notification, new_Notification = false, popup = false)
{
    const icon = Widget.Box({
        vpack: "center",
        hpack: "center",
        class_name: "icon",
        child: NotificationIcon(n),
    })

    const title = Widget.Label({
        class_name: "title",
        xalign: 0,
        justification: "left",
        hexpand: true,
        max_width_chars: 24,
        truncate: "end",
        wrap: true,
        label: n.summary,
        use_markup: true,
    })

    const body = Widget.Label({
        class_name: "body",
        hexpand: true,
        use_markup: true,
        truncate: popup ? "none" : "end",
        xalign: 0,
        justification: "left",
        label: n.body,
        wrap: true,
    })

    const actions: string[][] = n.hints.actions ? readJson(n.hints.actions.get_string()[0]) : [];

    const Actions = Widget.Box({
        class_name: "actions",
        spacing: 5,
        // hpack: "fill",
        children: actions.map((action) => Widget.Button({
            class_name: action[0].includes("Delete") ? "delete" : "",
            // hpack: action[0].includes("Delete") ? "end" : "fill",
            on_clicked: () =>
            {
                Hyprland.sendMessage(`dispatch exec ${action[1]}`)
                    .then(() => Utils.execAsync('killall notify-send')).catch((err) => Utils.notify(err))
            },
            hexpand: true,
            child: Widget.Label(action[0].includes("Delete") ? "󰆴" : action[0]),
        })
        ),
    });


    // const actions = Widget.Box({
    //     class_name: "actions",
    //     children: n.actions.map(({ id, label }) => Widget.Button({
    //         on_clicked: () =>
    //         {
    //             const [command, action] = label.split(':');
    //             Hyprland.sendMessage(`dispatch exec ${command}`).then(() => Utils.execAsync('killall notify-send'))

    //             // n.invoke(id)

    //         },
    //         hexpand: true,
    //         child: Widget.Label(label.split(':')[1]),
    //     })),
    // })

    const close = Widget.Button({
        class_name: "close",
        on_clicked: async () => n.close(),
        child: Widget.Icon("window-close-symbolic"),
    })

    return Widget.EventBox(
        {
            attribute: { id: n.id },
            on_primary_click: n.dismiss,
        },
        Widget.Box(
            {
                class_name: `notification ${n.urgency} ${n.app_name}`,
                css: new_Notification ? "animation: background-pop 0.5s ease;" : "",
                vertical: true,
            },
            Widget.Box([
                icon,
                Widget.Box(
                    { vertical: true },
                    Widget.Box({
                        hexpand: true,
                        children: popup ? [title] : [title, close],
                    }),
                    body,
                ),
            ]),
            Actions,
        ),
    )
}