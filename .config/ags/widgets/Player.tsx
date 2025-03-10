import { bind } from "astal";
import AstalMpris from "gi://AstalMpris?version=0.1";
import { getDominantColor } from "../utils/image";
import { Gtk } from "astal/gtk3";
import { rightPanelWidth } from "../variables";

const FALLBACK_ICON = "audio-x-generic-symbolic";
const PLAY_ICON = "media-playback-start-symbolic";
const PAUSE_ICON = "media-playback-pause-symbolic";
const PREV_ICON = "media-skip-backward-symbolic";
const NEXT_ICON = "media-skip-forward-symbolic";

function lengthStr(length: number) {
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const sec0 = sec < 10 ? "0" : "";
  return `${min}:${sec0}${sec}`;
}

/** @param {import('types/service/mpris').MprisPlayer} player */
export function Player(
  player: AstalMpris.Player,
  playerType: "popup" | "widget"
) {
  const dominantColor = bind(player, "coverArt").as((path) =>
    getDominantColor(path)
  );
  const img = () => {
    if (playerType == "widget") return <box></box>;

    return (
      <box
        valign={Gtk.Align.CENTER}
        child={
          <box
            className="img"
            css={bind(player, "coverArt").as(
              (p) => `
                    background-image: url('${p}');
                    box-shadow: 0 0 5px 0 ${getDominantColor(p)};
                `
            )}
          />
        }></box>
    );
  };
  const title = (
    <label
      className="title"
      max_width_chars={20}
      truncate={true}
      label={bind(player, "title").as((t) => t || "Unknown Track")}></label>
  );

  const artist = (
    <label
      className="artist"
      max_width_chars={20}
      truncate={true}
      label={bind(player, "artist").as((a) => a || "Unknown Artist")}></label>
  );

  //   const positionSlider = Widget.slider({
  //     class_name: "slider",
  //     draw_value: false,
  //     css: dominantColor.as((c) => `highlight{background: ${c}00}`),
  //     on_change: ({ value }) => (player.position = value * player.length),
  //     visible: player.bind("length").as((l) => l > 0),
  //     setup: (self) => {
  //       function update() {
  //         const value = player.position / player.length;
  //         self.value = value > 0 ? value : 0;
  //       }
  //       self.hook(player, update);
  //       self.hook(player, update, "position");
  //       self.poll(1000, update);
  //     },
  //   });
  const positionSlider = (
    <slider
      className="slider"
      draw_value={false}
      css={dominantColor.as((c) => `highlight{background: ${c}00}`)}
      onDragged={({ value }) => (player.position = value * player.length)}
      visible={bind(player, "length").as((l) => l > 0)}
      value={bind(player, "position").as((p) =>
        player.length > 0 ? p / player.length : 0
      )}
      // setup={(self) => {
      //   function update() {
      //     const value = player.position / player.length;
      //     self.value = value > 0 ? value : 0;
      //   }
      //   self.hook(player, "changed", update);
      //   self.hook(player, "position", update);
      //   // self.poll(1000, update);
      // }}
    />
  );

  //   const positionLabel = Widget.label({
  //     class_name: "position",
  //     hpack: "start",
  //     setup: (self) => {
  //       const update = (_, time) => {
  //         self.label = lengthStr(time || player.position);
  //         self.visible = player.length > 0;
  //       };

  //       self.hook(player, update, "position");
  //       self.poll(1000, update as any);
  //     },
  //   });
  const positionLabel = (
    <label
      className="position"
      halign={Gtk.Align.START}
      label={bind(player, "position").as(lengthStr)}
      visible={bind(player, "length").as((l) => l > 0)}
      // setup={(self) => {
      //   const update = (_: any, time: any) => {
      //     self.label = lengthStr(time || player.position);
      //     self.visible = player.length > 0;
      //   };

      //   self.hook(player, "position", update);
      //   // self.poll(1000, update as any);
      // }}
    ></label>
  );
  const lengthLabel = (
    <label
      className="length"
      halign={Gtk.Align.END}
      visible={bind(player, "length").as((l) => l > 0)}
      label={bind(player, "length").as(lengthStr)}></label>
  );

  // const icon = Widget.icon({
  //   class_name: "icon",
  //   hexpand: true,
  //   hpack: "end",
  //   vpack: "center",
  //   tooltip_text: player.identity || "",
  //   icon: player.bind("entry").transform((entry) => {
  //     const name = `${entry}-symbolic`;
  //     return Utils.lookUpicon(name) ? name : FALLBACK_ICON;
  //   }),
  // });
  const icon = (
    <box halign={Gtk.Align.END} valign={Gtk.Align.CENTER}>
      {/* <icon
        className="icon"
        tooltip_text={bind(player, "identity").as((i) => i || "")}
        icon={bind(player, "entry").as((entry) => {
          const name = `${entry}-symbolic`;
          return Gtk.Utils.lookUpicon(name) ? name : FALLBACK_ICON;
        })}></icon> */}
    </box>
  );

  const playPause = (
    <button
      on_clicked={() => player.play_pause()}
      className="play-pause"
      visible={bind(player, "can_play").as((c) => c)}
      child={
        <icon
          icon={bind(player, "playbackStatus").as((s) => {
            switch (s) {
              case AstalMpris.PlaybackStatus.PLAYING:
                return PAUSE_ICON;
              case AstalMpris.PlaybackStatus.PAUSED:
              case AstalMpris.PlaybackStatus.STOPPED:
                return PLAY_ICON;
            }
          })}></icon>
      }></button>
  );

  // const prev = Widget.button({
  //   on_clicked: () => player.previous(),
  //   visible: player.bind("can_go_prev"),
  //   child: Widget.icon(PREV_ICON),
  // });
  const prev = (
    <button
      on_clicked={() => player.previous()}
      visible={bind(player, "can_go_previous").as((c) => c)}
      child={<icon icon={PREV_ICON}></icon>}></button>
  );

  // const next = Widget.button({
  //   on_clicked: () => player.next(),
  //   visible: player.bind("can_go_next"),
  //   child: Widget.icon(NEXT_ICON),
  // });
  const next = (
    <button
      on_clicked={() => player.next()}
      visible={bind(player, "can_go_next").as((c) => c)}
      child={<icon icon={NEXT_ICON}></icon>}></button>
  );

  return (
    <box
      className={`player ${playerType}`}
      vexpand={false}
      css={bind(player, "coverArt").as((p) =>
        playerType == "widget"
          ? `
                min-height:${rightPanelWidth.get()}px;
                background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
                    url('${p}');
                `
          : ``
      )}>
      {img()}
      <box vertical={true} hexpand={true} spacing={5}>
        <box>
          {artist}
          {icon}
        </box>
        <box vexpand={true}></box>
        {title}
        {positionSlider}
        <centerbox>
          {positionLabel}
          <box>
            {prev}
            {playPause}
            {next}
          </box>
          {lengthLabel}
        </centerbox>
      </box>
    </box>
  );
}
