from django.conf.urls import include, url

from django.contrib import admin

from app.ip import views

admin.autodiscover()

urlpatterns = [
    # Examples:
    # url(r'^$', 'ipadmin.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', views.index, name='index'),

    # IPv6 Allocation
    #    url(r'^ipv6_allocations/$', views.IPv6AllocationListView.as_view(), name='ipv6_allocations'),

    # Customer
    url(r'^customers/$',
        views.CustomerListView.as_view(),
        name='customerlist_view'),

    # Regions
    url(r'^regions/$',
        views.IPv6RegionListView.as_view(),
        name='regionlist_view'),

    # Customerm Assignments
    url(r'^assignments/$',
        views.IPv6AssignmentListView.as_view(),
        name='assignmentlist_view'),

    # Functions
    url(r'^add_ipv6_allocation/$',
        views.add_ipv6_allocation,
        name='add_ipv6_allocation'),
    url(r'^region/$', views.create_region,
        name='create_region'),
    url(r'^subregion/(?P<pk>\d+)/generate_assignment',
        views.generate_assignment, name='generate_assignment'),
    url(r'^customer/$', views.create_customer, name='customer'),
    url(r'^assignment/(?P<pk>\d+)/set_customer$',
        views.assignment_set_customer,
        name='assignment_set_customer'),

]
