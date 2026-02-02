import pytest

from api.tests.factories import DashUserFactory


@pytest.mark.django_db
def test_dashuser_role_display_labels():
    admin_user = DashUserFactory(access_level=0)
    otp_user = DashUserFactory(access_level=1)
    redpay_user = DashUserFactory(access_level=2)

    assert admin_user.get_access_level_display() == "ADMIN"
    assert otp_user.get_access_level_display() == "OTP"
    assert redpay_user.get_access_level_display() == "REDPAY"

    assert "ADMIN" in str(admin_user)
    assert "OTP" in str(otp_user)
    assert "REDPAY" in str(redpay_user)
