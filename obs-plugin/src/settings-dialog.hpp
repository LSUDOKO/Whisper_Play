#pragma once
#include <obs-module.h>
#include <Qt>
#include <QDialog>
#include <QLineEdit>
#include <QPushButton>
#include <QVBoxLayout>

class WhisperPlaySettings : public QDialog {
    Q_OBJECT

public:
    WhisperPlaySettings(QWidget *parent = nullptr)
        : QDialog(parent)
    {
        setWindowTitle("WhisperPlay Settings");

        QVBoxLayout *layout = new QVBoxLayout(this);

        // Server URL
        serverUrlEdit = new QLineEdit(this);
        serverUrlEdit->setPlaceholderText("Enter signaling server URL");
        layout->addWidget(serverUrlEdit);

        // Save button
        QPushButton *saveButton = new QPushButton("Save", this);
        connect(saveButton, &QPushButton::clicked, this, &WhisperPlaySettings::saveSettings);
        layout->addWidget(saveButton);

        loadSettings();
    }

private slots:
    void saveSettings() {
        obs_data_t *settings = obs_data_create();
        obs_data_set_string(settings, "server_url", serverUrlEdit->text().toUtf8().constData());
        obs_data_release(settings);
        accept();
    }

private:
    void loadSettings() {
        obs_data_t *settings = obs_data_create();
        const char *url = obs_data_get_string(settings, "server_url");
        if (url) {
            serverUrlEdit->setText(QString::fromUtf8(url));
        }
        obs_data_release(settings);
    }

    QLineEdit *serverUrlEdit;
};
